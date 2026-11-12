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
import { el, f, inkDefs, run, INK_DAY, PAPER } from '@/lib/ink/ink';
import { ease } from '@/lib/ink/motion';
import { applyPalette, palette } from '@/lib/ink/daynight';
import { createFigure, LAB_COAT } from './figure';
import { microscopeStation, type Station } from './stations/microscope';

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
  /*
    Filtre bölgesini kullanıcı uzayına sabitle.

    `inkDefs()` filtreyi varsayılan `objectBoundingBox` birimleriyle kuruyor:
    bölge, filtrenin uygulandığı grubun sınırlayıcı kutusuna göre. Yürüyen
    figür o grubun içinde olduğu için kutu her karede değişiyor, bölge
    kayıyor ve türbülans yeniden örnekleniyordu — sonuç, sabit duran zemin
    çizgisinin her adımda titremesiydi. Bölge banda sabitlenince gürültü
    deseni de sabit kalıyor.
  */
  const edge = svg.querySelector('#ink-strip-edge');
  if (edge) {
    edge.setAttribute('filterUnits', 'userSpaceOnUse');
    edge.setAttribute('x', '-12');
    edge.setAttribute('y', '-12');
    edge.setAttribute('width', String(VIEW_W + 24));
    edge.setAttribute('height', String(VIEW_H + 24));
  }
  svg.style.setProperty('--paper', PAPER);
  svg.style.color = INK_DAY;

  el('rect', { x: 0, y: 0, width: VIEW_W, height: VIEW_H, class: 'pp' }, svg);

  // Günün saati. Şimdilik sabit sabah ışığı; ileride şerit boyunca
  // sabahtan geceye kayacak.
  applyPalette(svg, palette(options.tau ?? 0.34));

  // Mürekkep filtresi sahne grubuna takılır, kâğıda değil
  const scene = el('g', { filter }, svg);

  // Zemin çizgisi
  const floor = el('path', {
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 1.35 * SCALE,
    'stroke-linecap': 'round',
  }, scene);
  floor.setAttribute('d', `M0 ${GROUND} L${VIEW_W} ${GROUND}`);

  // ── Duraklar ───────────────────────────────────────────────
  const stations: Station[] = [microscopeStation(scene)];
  stations.forEach((station, i) => placeAt(station.g, SLOTS[i]));

  // ── Yürüyen kişi ───────────────────────────────────────────
  const figure = createFigure(scene, LAB_COAT);

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
  let sit = 0;
  let x = -40;

  /* Oturulduğunda figür durağın tam yerine konuyor, böylece durağın
     yerel koordinatları ile figürünkiler çakışıyor ve eller doğrudan
     mobilyanın verdiği noktalara gidebiliyor. */
  const seatX = (i: number): number => SLOTS[i];

  const STEP = 1 / 60;
  const MAX_STEPS = 5;
  let acc = 0;

  const simulate = (dt: number): void => {
    const station = stations[target];
    switch (phase) {
      case 'walking': {
        go = Math.min(1, go + dt * 3);
        const dx = figure.update(dt, { go, sit: 0 });
        x += dx * SCALE;
        if (station && x >= seatX(target) - 2) {
          phase = 'stopping';
          timer = 0;
        } else if (!station && x > VIEW_W + 40) {
          x = -40;
          target = 0;
        }
        return;
      }
      case 'stopping': {
        timer += dt;
        go = Math.max(0, 1 - timer / STOP_TIME);
        figure.update(dt, { go, sit: 0 });
        if (timer >= STOP_TIME) {
          phase = 'sitting';
          timer = 0;
          x = seatX(target);
        }
        return;
      }
      case 'sitting': {
        timer += dt;
        sit = ease(Math.min(1, timer / SIT_TIME));
        figure.update(dt, { go: 0, sit, work: station?.work });
        if (timer >= SIT_TIME) {
          phase = 'working';
          timer = 0;
        }
        return;
      }
      case 'working': {
        timer += dt;
        figure.update(dt, { go: 0, sit: 1, work: station?.work });
        if (timer >= WORK_TIME) {
          phase = 'standing';
          timer = 0;
        }
        return;
      }
      case 'standing': {
        timer += dt;
        sit = 1 - ease(Math.min(1, timer / SIT_TIME));
        figure.update(dt, { go: 0, sit, work: station?.work });
        if (timer >= SIT_TIME) {
          phase = 'walking';
          sit = 0;
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
