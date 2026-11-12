/*
  Çizgi-sanat şeridi.

  Uzun, ince bir bant: beş durak aynı anda görünüyor ve tek bir kişi
  aralarında yürüyor. Kamera yok, kaydırmaya bağlı bir şey yok — sayfaya
  oturan sabit bir kart.

  Duraklar kendi yerel uzaylarında çiziliyor (zemin y=120); bantta ortak
  bir ölçekle yerleşiyorlar, böylece mobilya ile figür aynı boyda kalıyor.

  `run()` hareket azaltma tercihini ve `?debug` / `?t=` parametrelerini
  kendisi yönetiyor: hareket kısıtlıysa tek kare çizip duruyor.
*/
import { curve, el, f, inkDefs, run, INK_DAY, PAPER } from '@/lib/ink/ink';
import { clamp, ease, lerp, seeded } from '@/lib/ink/motion';
import { applyPalette, palette } from '@/lib/ink/daynight';
import { createFigure, TEE, type Costume, type WorkPose } from './figure';
import { microscopeStation, type Station } from './stations/microscope';
import { deskStation } from './stations/desk';
import { coffeeStation } from './stations/coffee';

export interface StripOptions {
  /** Günün saati: 0 gece yarısı, 0.5 öğlen. */
  tau?: number;
}

/** Bant: beşi birden sığacak kadar geniş, ince kalacak kadar alçak. */
const VIEW_W = 900;
const VIEW_H = 180;
const GROUND = 150;
/** Mobilya ve figür ortak ölçek kullanıyor. */
const SCALE = 0.85;
/** Durakların bant üzerindeki yerleri. */
const SLOTS = [95, 275, 455, 635, 815];

/** Yerel (40, 120) noktasını banttaki (x, GROUND) noktasına taşır. */
const placeAt = (g: Element, x: number): void =>
  g.setAttribute('transform', `translate(${f(x)} ${GROUND}) scale(${f(SCALE)}) translate(-40 -120)`);

export function createStrip(host: HTMLElement, options: StripOptions = {}): () => void {
  const svg = el('svg', {
    viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
    role: 'img',
    'aria-label':
      'Çizgi çizimi: aynı kişinin beş hâli — mikroskop başında, dizüstüyle, telefonuyla, motosikletinde ve oyun oynarken',
  });
  svg.style.display = 'block';
  svg.style.width = '100%';
  svg.style.height = 'auto';

  // Kâğıt dolgusunu `applyPalette` sürüyor; kural sahnenin içinde dursun ki
  // bileşen sayfanın global stiline bağımlı olmasın.
  el('style', {}, svg).textContent = '.pp{fill:var(--paper)}';

  const { filter } = inkDefs(svg, 'ink-strip');
  svg.style.setProperty('--paper', PAPER);
  svg.style.color = INK_DAY;

  el('rect', { x: 0, y: 0, width: VIEW_W, height: VIEW_H, class: 'pp' }, svg);

  // Günün saati. Şimdilik sabit sabah ışığı; ileride şerit boyunca
  // sabahtan geceye kayacak.
  applyPalette(svg, palette(options.tau ?? 0.34));

  /*
    Mürekkep filtresi ortak bir üst gruba DEĞİL, hareket eden her parçanın
    kendi grubuna takılıyor.

    Filtreli bir grubun içindeki çocuk kıpırdayınca tarayıcı filtre
    çıktısını yeniden hesaplamak zorunda kalıyor; Safari bu durumda boyama
    bölgesini eksik geçersiz kılıp figürün arkasında iz bırakıyor.
    Filtre doğrudan figürün grubundaysa içerik kendi yerel uzayında sabit
    kalıyor ve hareketi dıştaki dönüşüm yapıyor — kütüphanenin yürüyen
    figür örneğinin yaptığı da bu.
  */
  const scene = el('g', {}, svg);

  /*
    Zemin çizgisi filtresiz.

    Düz yatay bir yolun sınırlayıcı kutusu sıfır yükseklikte; mürekkep
    filtresinin bölgesi bu kutuya oranlı olduğu için filtre uygulanınca
    çizgi tamamen kayboluyor. Elle çizilmişlik hissi bunun yerine yolun
    kendisine işleniyor: tohumlu rastgelelikle küçük dikey sapmalar, yani
    her açılışta aynı çizgi.
  */
  const rnd = seeded(23);
  const floorPts: string[] = [];
  for (let x = 0; x <= VIEW_W; x += 18) {
    floorPts.push(`${x === 0 ? 'M' : 'L'}${f(x)} ${f(GROUND + rnd(-0.35, 0.35))}`);
  }
  const floor = el('path', {
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 1.35 * SCALE,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }, scene);
  floor.setAttribute('d', floorPts.join(' '));

  // ── Duraklar ───────────────────────────────────────────────
  const stations: Station[] = [
    microscopeStation(scene),
    deskStation(scene),
    coffeeStation(scene),
  ];
  stations.forEach((station, i) => {
    station.g.setAttribute('filter', filter);
    placeAt(station.g, SLOTS[i]);
  });

  // ── Yürüyen kişi ───────────────────────────────────────────
  const figure = createFigure(scene);
  figure.g.setAttribute('filter', filter);

  /*
    Kıyafet, gidilen durağınki. Yürürken bir sonraki durağın kıyafeti
    giyiliyor — hikâye zaten o: önlüğü çıkarıp sweatshirt'ü geçirmek
    iki durak arasında oluyor.
  */
  const costumeFor = (i: number): Costume => stations[i]?.costume ?? TEE;

  /*
    Durum makinesi. Figür yürür, durağa varınca yavaşlar, oturur, bir süre
    çalışır, kalkar ve devam eder.

    `go` ve `sit` ayrı ayrı yumuşatılıyor çünkü sıralı olmaları gerekiyor:
    önce adım sönüyor (motion.md'nin önerdiği ~0.4 sn), ancak durduktan
    sonra oturma başlıyor. İkisi aynı anda sürülürse figür yürürken
    çömeliyor.
  */
  type Phase = 'walking' | 'stopping' | 'sitting' | 'working' | 'standing';
  const STOP_TIME = 0.45;
  const SIT_TIME = 0.8;
  const WORK_TIME = 7;

  let phase: Phase = 'walking';
  let target = 0; // sıradaki durak
  let timer = 0;
  let go = 1;
  /** 0 ayakta/serbest, 1 durakta yerleşmiş. */
  let settle = 0;
  let x = -40;

  /* Oturulduğunda figür durağın tam yerine konuyor, böylece durağın
     yerel koordinatları ile figürünkiler çakışıyor ve eller doğrudan
     mobilyanın verdiği noktalara gidebiliyor. */
  const seatX = (i: number): number => SLOTS[i];

  /*
    Yudum döngüsü. Durakta çalışırken ikinci poz varsa `work` ile onun
    arasında gidip geliniyor: kupa masada durur, kalkar, bir süre ağızda
    kalır, geri iner. Keyfi bir sinüs yerine anahtarlanmış eğri —
    duraklama süreleri böyle okunur kalıyor.
  */
  const ALT_PERIOD = 6.4;
  const altCurve = curve([[0, 0], [1.9, 0], [2.7, 1], [4.1, 1], [5, 0]], ALT_PERIOD);
  const mixPose = (a: WorkPose, b: WorkPose, u: number): WorkPose => ({
    head: [lerp(a.head[0], b.head[0], u), lerp(a.head[1], b.head[1], u)],
    nearHand: [lerp(a.nearHand[0], b.nearHand[0], u), lerp(a.nearHand[1], b.nearHand[1], u)],
    farHand: [lerp(a.farHand[0], b.farHand[0], u), lerp(a.farHand[1], b.farHand[1], u)],
  });

  const STEP = 1 / 60;
  const MAX_STEPS = 5;
  let acc = 0;

  const simulate = (dt: number): void => {
    const station = stations[target];
    switch (phase) {
      case 'walking': {
        go = Math.min(1, go + dt * 3);
        const dx = figure.update(dt, { costume: costumeFor(target), go, sit: 0 });
        x += dx * SCALE;
        if (station && x >= seatX(target) - 2) {
          phase = 'stopping';
          timer = 0;
        } else if (!station && x > VIEW_W + 40) {
          // Son duraktan sonra bandın dışına çıkıp baştan başlıyor
          x = -40;
          target = 0;
        }
        return;
      }
      case 'stopping': {
        timer += dt;
        go = Math.max(0, 1 - timer / STOP_TIME);
        figure.update(dt, { costume: costumeFor(target), go, sit: 0 });
        if (timer >= STOP_TIME) {
          phase = 'sitting';
          timer = 0;
          x = seatX(target);
        }
        return;
      }
      case 'sitting': {
        timer += dt;
        station?.setPropHeld?.(false);
        settle = ease(Math.min(1, timer / SIT_TIME));
        figure.update(dt, {
          costume: costumeFor(target),
          go: 0,
          sit: station?.pose === 'sit' ? settle : 0,
          reach: settle,
          work: station?.work,
        });
        if (timer >= SIT_TIME) {
          phase = 'working';
          timer = 0;
        }
        return;
      }
      case 'working': {
        timer += dt;
        const alt = station?.workAlt ? clamp(altCurve(timer), 0, 1) : 0;
        const pose =
          station?.work && station.workAlt
            ? mixPose(station.work, station.workAlt, alt)
            : station?.work;
        // Nesne elde sayıldığı anda masadaki kopyası gizleniyor; el o anda
        // zaten kupanın masadaki yerinde olduğu için geçiş görünmüyor.
        const held = alt > 0.02;
        station?.setPropHeld?.(held);
        figure.update(dt, {
          costume: costumeFor(target),
          go: 0,
          sit: station?.pose === 'sit' ? 1 : 0,
          reach: 1,
          work: pose,
          prop: held ? station?.prop : undefined,
        });
        if (timer >= WORK_TIME) {
          phase = 'standing';
          timer = 0;
        }
        return;
      }
      case 'standing': {
        timer += dt;
        station?.setPropHeld?.(false);
        settle = 1 - ease(Math.min(1, timer / SIT_TIME));
        figure.update(dt, {
          costume: costumeFor(target),
          go: 0,
          sit: station?.pose === 'sit' ? settle : 0,
          reach: settle,
          work: station?.work,
        });
        if (timer >= SIT_TIME) {
          phase = 'walking';
          settle = 0;
          go = 0;
          target = target + 1 < stations.length ? target + 1 : stations.length;
        }
        return;
      }
    }
  };

  const stop = run((t, dt) => {
    for (const s of stations) s.update(t, dt);

    /*
      Simülasyon sabit adımlı. Doğrudan karenin `dt`'siyle ilerletince
      figür her karede farklı mesafe kat ediyor; bu sayfada arka plan
      videosu, GSAP ve ses çözümleyici de döndüğü için kare aralığı
      düzensiz oluyor ve bu, bandın tek hareketli nesnesinde titreme
      olarak görünüyor.
    */
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < MAX_STEPS) {
      simulate(STEP);
      acc -= STEP;
      n += 1;
    }
    if (acc > STEP * MAX_STEPS) acc = 0;
    placeAt(figure.g, x);
  });

  host.appendChild(svg);

  return () => {
    stop();
    svg.remove();
  };
}
