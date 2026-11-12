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
import { mix, nightTint, palette, rgb, toRGB, type Palette, type RGB } from '@/lib/ink/daynight';
import { createFigure, TEE, type Costume, type WorkPose } from './figure';
import { ACCENT as ACCENT_HEX, microscopeStation, type Station } from './stations/microscope';
import { deskStation } from './stations/desk';
import { coffeeStation } from './stations/coffee';
import { bikeStation } from './stations/bike';
import { gamingStation } from './stations/gaming';

/*
  Günün saati bant boyunca kayıyor: solda sabah, sağda akşam. Bir
  durağın saati, bantta durduğu yerden geliyor.

  Geçiş neden temaya bölünmüş: `daynight` mürekkebi bir eşikte koyudan
  açığa çeviriyor (gece kâğıt lacivert, çizgi açık) ve bu dönüşüm
  τ≈0.751'de, gün döngüsünün yüzde ikilik bir diliminde oluyor. Tek bir
  bant sabahtan geceye uzatıldığında bu eşik bandın ortasına düşüyor ve
  ne kadar yayılırsa yayılsın sıcak şeftaliden soğuk mora atlayan bir
  duvar olarak okunuyor.

  Bu yüzden iki eğri var ve ikisi de eşiğin tek bir yanında kalıyor:
  açık temada sabahtan altın saate, koyu temada alacakaranlıktan
  geceye. Eşik artık bandın içinde değil, kullanıcının tema düğmesine
  bastığı anda — geçişin zaten beklendiği yerde — yaşanıyor.
*/
type DayCurve = ReadonlyArray<readonly [u: number, tau: number]>;
/** Açık tema: serin sabah → parlak öğle → altın saat. Eşiğin (0.735) hep solunda. */
const DAY_LIGHT: DayCurve = [[0, 0.295], [0.45, 0.5], [1, 0.732]];
/** Koyu tema: alacakaranlık → gece. Eşiğin (0.756) hep sağında. */
const DAY_DARK: DayCurve = [[0, 0.774], [0.5, 0.82], [1, 0.878]];

const tauOn = (curve: DayCurve, u: number): number => {
  const t = clamp(u, 0, 1);
  for (let i = 1; i < curve.length; i++) {
    if (t <= curve[i][0]) {
      return lerp(curve[i - 1][1], curve[i][1], (t - curve[i - 1][0]) / (curve[i][0] - curve[i - 1][0]));
    }
  }
  return curve[curve.length - 1][1];
};

/*
  Gradyan basamağı. Bütün gradyanlar aynı aralığı aynı sıklıkta
  örnekliyor — zemin de, her durağın kâğıdı da — yoksa yaklaşımlar
  birbirini tutmaz ve durakların dolgusu arka planla aynı rengi
  vermezdi.
*/
const STOPS = 64;

/** Bant: beşi birden sığacak kadar geniş, ince kalacak kadar alçak. */
const VIEW_W = 900;
const VIEW_H = 180;
const GROUND = 150;
/*
  Görünen pencerenin üst kenarı. Koordinatlar 0'dan başlıyor ama en
  yüksek çizim (kasklı başın tepesi, oyuncu koltuğunun boyunluğu) y≈68'de
  bitiyor; üstündeki her şey boş kâğıt. Sayfaya konunca bu boşluk
  çizimden çok yer kaplıyordu. Pencere aşağıdan başlayınca oran 5:1'den
  6.6:1'e iniyor — istenen "ince bant" bu.
*/
const VIEW_TOP = 44;
/** Mobilya ve figür ortak ölçek kullanıyor. */
const SCALE = 0.85;
/** Durakların bant üzerindeki yerleri. */
const SLOTS = [95, 275, 455, 635, 815];

/*
  Yerel (40, 120) noktasını banttaki (x, GROUND) noktasına taşır.

  `face` yatay ölçeğin işareti: +1 sağa, -1 sola bakıyor. Dönüş sırasında
  aradan geçtiği için tam sayı olmak zorunda değil — sıfırda figür bir
  çizgiye iniyor ve iki boyutlu çizimde dönüş tam olarak böyle okunuyor.
*/
const placeAt = (g: Element, x: number, face = 1): void =>
  g.setAttribute(
    'transform',
    `translate(${f(x)} ${GROUND}) scale(${f(SCALE * face)} ${f(SCALE)}) translate(-40 -120)`
  );

/*
  Dışarıdan gelen metinler. Durak adları ipucu balonunda ve ekran
  okuyucuda görünüyor, yani sayfanın diline bağlılar — bileşenin içine
  gömülürlerse dil değişince Türkçe kalıyorlar.
*/
export interface StripLabels {
  /** Şeridin tamamını anlatan metin. */
  readonly scene: string;
  /** Durak adları, bandaki sırayla. */
  readonly stations: readonly string[];
  /** Bir durağa götüren düğmenin etiketi. */
  action(name: string): string;
}

export interface StripOptions {
  /**
   * Her karede figürün bant üzerindeki yeri. Dar ekranda şerit yatayda
   * kayıyor ve kişi görüş alanından çıkıyor; sarmalayıcı bunu kullanıp
   * kaydırmayı ona tutturuyor.
   */
  onMove?(x: number, viewW: number): void;
  /** İlk metinler; sonradan `setLabels` ile değiştirilebiliyor. */
  labels?: StripLabels;
}

export interface Strip {
  /** Sahneyi söker, dinleyicileri bırakır. */
  destroy(): void;
  /** Dil değişince çağrılıyor; sahne yeniden kurulmuyor. */
  setLabels(labels: StripLabels): void;
}

export function createStrip(host: HTMLElement, options: StripOptions = {}): Strip {
  const svg = el('svg', {
    viewBox: `0 ${VIEW_TOP} ${VIEW_W} ${VIEW_H - VIEW_TOP}`,
    role: 'img',
    'aria-label':
      'Çizgi çizimi: aynı kişinin beş hâli — mikroskop başında, dizüstüyle, kahve molasında, motosikletine binerken ve oyun oynarken',
  });
  svg.style.display = 'block';
  svg.style.width = '100%';
  svg.style.height = 'auto';

  // Kâğıt dolgusunu `applyPalette` sürüyor; kural sahnenin içinde dursun ki
  // bileşen sayfanın global stiline bağımlı olmasın.
  el('style', {}, svg).textContent =
    '.pp{fill:var(--paper)}' +
    // Duraklar düğme: imleç, odak halkası yerine kendi işareti
    '.st{cursor:pointer}.st:focus{outline:none}.hit{fill:transparent}' +
    '.mark{opacity:0;transition:opacity .2s ease}' +
    '.st:hover .mark{opacity:.55}.st:focus-visible .mark{opacity:1}' +
    '@media(prefers-reduced-motion:reduce){.mark{transition:none}}';

  const { defs, filter } = inkDefs(svg, 'ink-strip');
  svg.style.setProperty('--paper', PAPER);
  svg.style.color = INK_DAY;

  const isDark = (): boolean => document.documentElement.classList.contains('dark');
  let day: DayCurve = isDark() ? DAY_DARK : DAY_LIGHT;
  const tauAt = (x: number): number => tauOn(day, x / VIEW_W);
  /** Ekranların gece aldığı sıcak ışık. */
  const LAMP: RGB = [255, 226, 168];
  const screenOf = (P: Palette): string => rgb(mix(P.paper, LAMP, P.lamp));

  /*
    Tema değişince renkler yeniden sürülecek. Gradyan düğümleri ve
    duraklar burada tutuluyor; `relight()` hepsini aynı anda güncelliyor.
    Düğümler yeniden yaratılmıyor, yalnızca renkleri değişiyor.
  */
  const grads: Array<{ stops: SVGStopElement[]; pick: (P: Palette) => RGB }> = [];
  const unbind: Array<() => void> = [];
  const tips: SVGTitleElement[] = [];
  const lit: Array<{ g: SVGGElement; x: number }> = [];

  /*
    Yatay gradyan. `x1/x2` YEREL koordinatta veriliyor: `userSpaceOnUse`
    gradyanı, ona başvuran öğenin kendi uzayında çözüyor. Durak grupları
    ölçekli ve kaydırılmış olduğu için her birine, aynı renk
    duraklarından oluşan ama uçları o durağın uzayına çevrilmiş kendi
    gradyanı veriliyor. Böylece bir durağın kâğıt dolgusu, arkasındaki
    zeminle tam olarak aynı rengi tutturuyor.
  */
  let gradN = 0;
  const gradient = (pick: (P: Palette) => RGB, x1: number, x2: number): string => {
    const id = `ink-strip-g${gradN++}`;
    const lg = el('linearGradient', {
      id, gradientUnits: 'userSpaceOnUse', x1: f(x1), y1: 0, x2: f(x2), y2: 0,
    }, defs);
    const stops: SVGStopElement[] = [];
    for (let i = 0; i <= STOPS; i++) {
      const u = i / STOPS;
      stops.push(el('stop', {
        offset: f(u),
        'stop-color': rgb(pick(palette(tauOn(day, u)))),
      }, lg));
    }
    grads.push({ stops, pick });
    return `url(#${id})`;
  };

  el('rect', {
    x: 0, y: VIEW_TOP, width: VIEW_W, height: VIEW_H - VIEW_TOP,
    fill: gradient((P) => P.paper, 0, VIEW_W),
  }, svg);

  /*
    Yıldızlar. Bandın üst üçte ikisi boş; gündüz orada bir şey yok ama
    gece o boşluk gökyüzü oluyor. Tohumlu rastgelelik, yani her açılışta
    aynı gökyüzü. Görünürlüğü paletin `night` değerinden geliyor, açık
    temada sıfır.
  */
  const sky = el('g', {}, svg);
  {
    const r = seeded(91);
    for (let i = 0; i < 46; i++) {
      const sx = r(6, VIEW_W - 6);
      // Zemine yaklaştıkça seyrelsinler: karesi alınmış dağılım yukarı toplar
      const t = r(0, 1) ** 2;
      el('circle', {
        cx: f(sx),
        cy: f(VIEW_TOP + 5 + t * 62),
        r: f(r(0.5, 1.25)),
        fill: 'rgb(239,230,207)',
        opacity: f(r(0.35, 1)),
      }, sky);
    }
  }

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
    // Zemin tüm bandı geçiyor, dolayısıyla mürekkebi de yol boyunca
    // değişmeli: tek renk yerine gradyan kontur.
    stroke: gradient((P) => P.ink, 0, VIEW_W),
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
    bikeStation(scene),
    gamingStation(scene),
  ];
  stations.forEach((station, i) => {
    station.g.setAttribute('filter', filter);
    placeAt(station.g, SLOTS[i]);

    // Durağın saati durduğu yerden. Çizgi ve düz renkler tek değer
    // (durak dar, içinde fark görünmez); kâğıt ise gradyan, çünkü
    // arkasındaki zeminle birebir tutmak zorunda.
    station.g.style.setProperty(
      '--paper',
      gradient((Q) => Q.paper, 40 - SLOTS[i] / SCALE, 40 + (VIEW_W - SLOTS[i]) / SCALE)
    );
    lit.push({ g: station.g, x: SLOTS[i] });

    /*
      Durak bir düğme. Tıklama birincil (dokunmatikte de çalışan tek
      şey o), üstüne gelmek ikincil bir ipucu: durağın altında ince bir
      çizgi beliriyor. Klavyeyle gezilebilsin diye her durak odak
      alabiliyor; tarayıcının odak halkası yerine aynı çizgi, bu kez
      tam görünürlükte.

      Vuruş alanı ayrı ve saydam bir dikdörtgen: çizgilerin üstüne denk
      getirmek gerekmesin. Duraklar bantta 180 piksel aralıklı, yerel
      uzayda bu 212 birim; ±100 birim bitişik ama örtüşmeyen alanlar
      veriyor.
    */
    const g = station.g;
    g.classList.add('st');
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', `${station.label} sahnesine git`);
    const tip = el('title', {});
    tip.textContent = station.label;
    g.insertBefore(tip, g.firstChild);
    tips.push(tip);
    const hit = el('rect', { x: -60, y: 30, width: 200, height: 100, class: 'hit' });
    g.insertBefore(hit, tip.nextSibling);
    el('path', {
      class: 'mark',
      // Mobilyanın yerel merkezi 40 değil ~59: işaret ona göre ortalanıyor
      d: 'M14 133 L104 133',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.8,
      'stroke-linecap': 'round',
    }, g);

    const pick = (): void => goTo(i);
    const onKey = (e: Event): void => {
      const key = (e as KeyboardEvent).key;
      if (key !== 'Enter' && key !== ' ') return;
      e.preventDefault();
      pick();
    };
    g.addEventListener('click', pick);
    g.addEventListener('keydown', onKey);
    unbind.push(() => {
      g.removeEventListener('click', pick);
      g.removeEventListener('keydown', onKey);
    });
  });

  const relight = (): void => {
    for (const { stops, pick } of grads) {
      stops.forEach((stop, i) => {
        stop.setAttribute('stop-color', rgb(pick(palette(tauOn(day, i / STOPS)))));
      });
    }
    for (const { g, x } of lit) {
      const P = palette(tauAt(x));
      g.style.color = rgb(P.ink);
      g.style.setProperty('--accent', nightTint(ACCENT_HEX, P));
      g.style.setProperty('--screen', screenOf(P));
      // Yalnızca geceye ait parçaların (far hâlesi, LED hâlesi) anahtarı
      g.style.setProperty('--lamp-on', f(P.lamp));
      // Küçük ışık kaynakları karartılmıyor, tersine geceleyin açılıyor
      g.style.setProperty('--led', rgb(mix(toRGB(ACCENT_HEX), [62, 214, 135], P.lamp)));
    }
    sky.setAttribute('opacity', f(palette(tauAt(VIEW_W / 2)).night));
  };


  // ── Yürüyen kişi ───────────────────────────────────────────
  const figure = createFigure(scene);
  figure.g.setAttribute('filter', filter);
  figure.gFar.setAttribute('filter', filter);

  /*
    Figürün saati sabit değil: yürüdükçe değişiyor, yani ışığı yanında
    taşıyor. Duraklarda olduğu gibi gradyan gerekmiyor — figür dar, bir
    ucundan öbürüne τ farkı 0.02 — ama kare başına güncellenmeli.
  */
  let figureTint: (c: string) => string = (c) => c;
  const lightFigure = (x: number): void => {
    const P = palette(tauAt(x));
    const ink = rgb(P.ink);
    const paper = rgb(P.paper);
    for (const node of [figure.g, figure.gFar]) {
      node.style.color = ink;
      node.style.setProperty('--paper', paper);
    }
    figureTint = (c) => nightTint(c, P);
  };

  /*
    Uzak bacağın z-sırası. Normalde figürün hemen altında, yani bütün
    durakların üstünde: şerit boyunca yürürken mobilyanın önünden
    geçiyor. `legsBehind` olan bir durağa oturulduğunda ise o durağın
    altına taşınıyor ve bacak makinenin arkasında kalıyor.

    Takas ayağa kalkmış hâlde yapılıyor (oturma başlarken ve kalkma
    biterken): o anda bacak dimdik aşağıda ve mobilyayla neredeyse hiç
    çakışmıyor, dolayısıyla sıra değişimi gözle seçilmiyor.
  */
  const legsTo = (under: Station | null): void => {
    const before = under ? under.g : figure.g;
    if (figure.gFar.nextSibling !== before) scene.insertBefore(figure.gFar, before);
  };

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
  type Phase = 'walking' | 'turning' | 'stopping' | 'sitting' | 'working' | 'standing';
  const STOP_TIME = 0.45;
  const SIT_TIME = 0.8;
  const WORK_TIME = 7;
  const TURN_TIME = 0.26;

  let phase: Phase = 'walking';
  let target = 0; // sıradaki durak
  let timer = 0;
  let go = 1;
  /** 0 ayakta/serbest, 1 durakta yerleşmiş. */
  let settle = 0;
  let x = -40;

  /*
    Yön. Okuyucu geride kalmış bir durağa tıklayabildiği için kişinin
    geri dönebilmesi gerekiyor. Yürüyüş hep yerel +x yönünde üretiliyor;
    sola gitmek, grubu yatayda aynalamak demek.

    `face` o anki bakış, `want` gidilecek bakış, `flip` aradaki animasyon
    değeri. Dönüş sırasında yürüme durduruluyor: figür önce duruyor,
    dönüyor, sonra yürüyor.
  */
  let face: 1 | -1 = 1;
  let want: 1 | -1 = 1;
  let flip = 1;
  /** Dönüş bitince geçilecek evre. */
  let turnThen: Phase = 'walking';
  /** Okuyucunun tıkladığı durak; sıradaki hedefi o belirliyor. */
  let pending: number | null = null;

  /* Oturulduğunda figür durağın tam yerine konuyor, böylece durağın
     yerel koordinatları ile figürünkiler çakışıyor ve eller doğrudan
     mobilyanın verdiği noktalara gidebiliyor. */
  const seatX = (i: number): number => SLOTS[i];

  /** Hedefe hangi yöne gidilecek; durak kalmadıysa bandın dışına, sağa. */
  const dirTo = (i: number): 1 | -1 => (stations[i] ? (seatX(i) >= x ? 1 : -1) : 1);

  /** Yürümeye başla; gerekiyorsa önce dön. */
  const beginWalk = (): void => {
    timer = 0;
    const d = dirTo(target);
    if (d === face) {
      phase = 'walking';
      return;
    }
    want = d;
    turnThen = 'walking';
    phase = 'turning';
  };

  /*
    Okuyucunun isteği. Hemen uygulanmıyor: kişi oturuyorsa önce kalkması
    gerekiyor, yürüyorsa hedefi değiştirmek yeterli. Zaten gidilen
    duraksa bir şey yapılmıyor — tıklamanın karşılığı orada hâlihazırda
    görülüyor.
  */
  const goTo = (i: number): void => {
    if (i === target && phase !== 'standing') return;
    pending = i;
    if (phase === 'working') timer = WORK_TIME; // işi burada kes, kalk
    if (phase === 'walking' || phase === 'turning' || phase === 'stopping') {
      target = i;
      pending = null;
      go = phase === 'walking' ? go : 0;
      beginWalk();
    }
  };

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
  /** İlk kare çizildi mi: görünürlük kontrolü ondan sonra başlıyor. */
  let primed = false;

  /*
    Hareket kısıtlıysa `run()` tek bir kare çizip duruyor. O tek kare
    kişinin bandın solunda, görüş alanının dışında olduğu an olursa
    geriye yalnızca mobilya kalıyor. Bu yüzden duruk okuyucu için
    başlangıç durumu bir durakta: masasında, çalışırken.
  */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target = 1;
    x = seatX(1);
    go = 0;
    settle = 1;
    phase = 'working';
  }

  const simulate = (dt: number): void => {
    const station = stations[target];
    switch (phase) {
      case 'walking': {
        go = Math.min(1, go + dt * 3);
        const dx = figure.update(dt, { tint: figureTint, costume: costumeFor(target), go, sit: 0 });
        x += dx * SCALE * face;
        const here = station && (face === 1 ? x >= seatX(target) - 2 : x <= seatX(target) + 2);
        if (here) {
          phase = 'stopping';
          timer = 0;
        } else if (!station && x > VIEW_W + 40) {
          // Son duraktan sonra bandın dışına çıkıp baştan başlıyor
          x = -40;
          target = 0;
        }
        return;
      }
      /*
        Dönüş. Yatay ölçek işaret değiştirirken sıfırdan geçiyor; o anda
        figür bir çizgi. Yürüme bu sırada duruyor, yoksa yerinde
        sayarken dönmüş gibi oluyor.
      */
      case 'turning': {
        timer += dt;
        const u = Math.min(1, timer / TURN_TIME);
        flip = lerp(face, want, ease(u));
        figure.update(dt, { tint: figureTint, costume: costumeFor(target), go: 0, sit: 0 });
        if (u >= 1) {
          face = want;
          flip = face;
          timer = 0;
          phase = turnThen;
        }
        return;
      }
      case 'stopping': {
        timer += dt;
        go = Math.max(0, 1 - timer / STOP_TIME);
        figure.update(dt, { tint: figureTint, costume: costumeFor(target), go, sit: 0 });
        if (timer >= STOP_TIME) {
          x = seatX(target);
          timer = 0;
          // Duraklar hep +x'e bakıyor; soldan gelindiyse önce dönülüyor.
          if (face !== 1) {
            want = 1;
            turnThen = 'sitting';
            phase = 'turning';
          } else {
            phase = 'sitting';
          }
        }
        return;
      }
      case 'sitting': {
        timer += dt;
        station?.setPropHeld?.(false);
        legsTo(station?.legsBehind ? station : null);
        settle = ease(Math.min(1, timer / SIT_TIME));
        figure.update(dt, {
          tint: figureTint,
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
          tint: figureTint,
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
          tint: figureTint,
          costume: costumeFor(target),
          go: 0,
          sit: station?.pose === 'sit' ? settle : 0,
          reach: settle,
          work: station?.work,
        });
        if (timer >= SIT_TIME) {
          legsTo(null);
          settle = 0;
          go = 0;
          // Okuyucunun seçtiği durak varsa oraya, yoksa sıradakine
          target = pending ?? (target + 1 < stations.length ? target + 1 : stations.length);
          pending = null;
          beginWalk();
        }
        return;
      }
    }
  };

  /*
    Tema düğmesi `<html>` üzerindeki `dark` sınıfını değiştiriyor;
    bileşen React ağacının dışında çizdiği için onu doğrudan izliyor.

    Figür de yeniden boyanmalı ve bu `relight()`'ın işi değil: figürün
    rengi her karede kendi konumundan hesaplanıyor. Hareket kısıtlıysa
    döngü tek kareden sonra durmuş oluyor, dolayısıyla tema değişince
    kimse o kareyi yenilemiyordu — duraklar aydınlanıyor, figür eski
    gecede kalıyordu. Bir adım simüle edip yeniden çizmek bunu
    kapatıyor; bir kare, görülecek bir şey değil.
  */
  const repaintFigure = (): void => {
    lightFigure(x);
    simulate(STEP);
    placeAt(figure.g, x, flip);
    placeAt(figure.gFar, x, flip);
  };
  relight();
  let dark = isDark();
  const themeWatch = new MutationObserver(() => {
    if (isDark() === dark) return;
    dark = !dark;
    day = dark ? DAY_DARK : DAY_LIGHT;
    relight();
    if (primed) repaintFigure();
  });
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  /*
    Bant yalnızca ekrandayken ilerliyor.

    İki nedeni var. Biri işlemci: şerit sayfanın ortasında duran, kendi
    kendine dönen tek hareketli parça. Diğeri ve asıl olanı anlatı:
    döngü sayfa açılır açılmaz başlarsa, ziyaretçi bölüme geldiğinde
    adamı dördüncü durakta oturur buluyordu. Şimdi bant görüş alanına
    girdiğinde kişi soldan, başından yürümeye başlıyor.

    `run()` döngüsü dönmeye devam ediyor; pahalı olan çizim, görünür
    olmadığı sürece hiç yapılmıyor. Böylece `t` sürekliliği bozulmuyor.
  */
  let onScreen = false;
  const watch = new IntersectionObserver(
    ([entry]) => { onScreen = entry.isIntersecting; },
    { rootMargin: '80px' }
  );
  watch.observe(svg);

  const stop = run((t, dt) => {
    if (!onScreen && primed) return;
    for (const s of stations) s.update(t, dt);

    /*
      Simülasyon sabit adımlı. Doğrudan karenin `dt`'siyle ilerletince
      figür her karede farklı mesafe kat ediyor; bu sayfada arka plan
      videosu, GSAP ve ses çözümleyici de döndüğü için kare aralığı
      düzensiz oluyor ve bu, bandın tek hareketli nesnesinde titreme
      olarak görünüyor.
    */
    lightFigure(x);

    // İlk karede tam bir adım borçlandırılıyor: `dt` sıfıra yakın
    // geldiğinde döngü hiç dönmez ve figür çizilmeden kalırdı.
    acc += primed ? dt : STEP;
    primed = true;
    let n = 0;
    while (acc >= STEP && n < MAX_STEPS) {
      simulate(STEP);
      acc -= STEP;
      n += 1;
    }
    if (acc > STEP * MAX_STEPS) acc = 0;
    placeAt(figure.g, x, flip);
    placeAt(figure.gFar, x, flip);
    options.onMove?.(x, VIEW_W);
  });

  host.appendChild(svg);

  const setLabels = (labels: StripLabels): void => {
    svg.setAttribute('aria-label', labels.scene);
    stations.forEach((station, i) => {
      const name = labels.stations[i] ?? station.label;
      tips[i].textContent = name;
      station.g.setAttribute('aria-label', labels.action(name));
    });
  };
  if (options.labels) setLabels(options.labels);

  return {
    setLabels,
    destroy() {
      stop();
      for (const off of unbind) off();
      watch.disconnect();
      themeWatch.disconnect();
      svg.remove();
    },
  };
}
