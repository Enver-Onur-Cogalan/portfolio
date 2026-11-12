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
  let x = -40;

  /*
    Simülasyon sabit adımlı.

    Doğrudan karenin `dt`'siyle ilerletince figür her karede farklı mesafe
    kat ediyor. Tarayıcı kare aralığı düzgün olmadığında (bu sayfada arka
    plan videosu, GSAP ve ses çözümleyici de dönüyor) bu, bandın tek
    hareketli nesnesinde titreme olarak görünüyor. Biriken zamanı 1/60'lık
    eşit adımlara bölünce hareket kare hızından bağımsız olarak düzgün
    akıyor.
  */
  const STEP = 1 / 60;
  /** Bir karede en fazla kaç adım: sekme arkaplandan dönünce sıçramasın. */
  const MAX_STEPS = 5;
  let acc = 0;

  const stop = run((t, dt) => {
    for (const s of stations) s.update(t, dt);

    acc += dt;
    let n = 0;
    while (acc >= STEP && n < MAX_STEPS) {
      // Figür kendi hızını döndürüyor; başka bir değerle ilerletirsek
      // basılı ayak kayar.
      x += figure.step(STEP) * SCALE;
      acc -= STEP;
      n += 1;
    }
    if (acc > STEP * MAX_STEPS) acc = 0;
    if (x > VIEW_W + 40) x = -40;
    placeAt(figure.g, x);
  });

  host.appendChild(svg);

  return () => {
    stop();
    svg.remove();
  };
}
