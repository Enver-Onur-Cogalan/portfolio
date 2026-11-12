/*
  Durak 1 — laboratuvar tezgâhı.

  Burada yalnızca mobilya var: tezgâh, tabure, mikroskop, defter ve kupa.
  Kişi ayrı bir modülde (`figure.ts`) ve bant boyunca yürüyüp sırası
  gelince bu durağa oturuyor.

  Yerel uzay figür uzayıyla aynı: zemin y=120, ölçek figürle ortak, böylece
  tabure yüksekliği ile figürün oturuşu birbirini tutuyor.
*/
import { blot, el, f, pen, pt, shape, PEN, PAPER, type Vec } from '@/lib/ink/ink';
import { LAB_COAT, type Costume, type WorkPose } from '../figure';

/** Şeridin tek vurgu rengi. Her durakta tekrar eden kupa bu renkte. */
export const ACCENT = '#2e8f63';

export interface Station {
  /** Durağın kendi grubu — bant onu yerleştirir. */
  readonly g: SVGGElement;
  /** Kişi oturduğunda ellerini ve başını götüreceği yerler (yerel uzay). */
  readonly work: WorkPose;
  /** Bu durakta giyilen kıyafet. */
  readonly costume: Costume;
  /** Durakta oturuluyor mu yoksa ayakta mı duruluyor. */
  readonly pose: 'sit' | 'stand';
  /** Durakta elde taşınan nesne. */
  readonly prop?: 'mug';
  /**
   * İkinci poz. Varsa durakta çalışırken `work` ile bunun arasında
   * yavaşça gidip geliniyor — kupayı masadan alıp içmek gibi.
   */
  readonly workAlt?: WorkPose;
  /** Nesne elde mi: durak masadaki kopyasını gizlesin diye. */
  setPropHeld?(held: boolean): void;
  /** Yerel uzaydaki genişlik — bantta duraklar arası boşluğu belirler. */
  readonly width: number;
  update(t: number, dt: number): void;
}

const BENCH_TOP = 72;
const SEAT = 88;

/** Okülerin ağzı: figür oturduğunda başını buraya getirecek. */
export const EYEPIECE: Vec = [55.4, 46.6];

export function microscopeStation(parent: Element): Station {
  const g = el('g', {}, parent);

  // ── Tabure ───────────────────────────────────────────────────
  shape(g, PEN * 0.9).setAttribute('d', `M22 ${SEAT} L50 ${SEAT} L50 ${SEAT + 3} L22 ${SEAT + 3}Z`);
  pen(g, PEN * 0.6).setAttribute('d', `M26 ${SEAT + 3} L24 120 M46 ${SEAT + 3} L48 120 M26 106 L45 106`);

  // ── Tezgâh ───────────────────────────────────────────────────
  shape(g, PEN).setAttribute(
    'd',
    `M50 ${BENCH_TOP} L108 ${BENCH_TOP} L108 ${BENCH_TOP + 3.4} L50 ${BENCH_TOP + 3.4}Z`
  );
  pen(g, PEN * 0.55).setAttribute('d', `M100 ${BENCH_TOP + 3.4} L101 120`);
  pen(g, PEN * 0.45).setAttribute('d', 'M78 100 L99 100');

  // ── Mikroskop ────────────────────────────────────────────────
  /*
    Okunur kılan iki şey: geniş ayak üstünde yükselen C biçimli kol ve
    eğimli göz merceği tüpü. Tüp SABİT bir parça — önceki sürümde her
    karede figürün o anki baş konumuna çiziliyordu ve adam geriye
    yaslanınca lastik gibi uzuyordu. Mikroskop katı bir nesne: kafa
    oküllere gidip gelir, oküler kafayı takip etmez.
  */
  const scope = el('g', {}, g);
  shape(scope, PEN).setAttribute(
    'd',
    `M57 ${BENCH_TOP} L77 ${BENCH_TOP} L74.4 ${BENCH_TOP - 3.4} L59.6 ${BENCH_TOP - 3.4}Z`
  );
  shape(scope, PEN).setAttribute(
    'd',
    'M65.4 68.6 L70.6 68.6 L70.6 56 Q70.2 52.4 66 51.6 L60.4 53.4 Q65.6 54.6 65.4 58.2Z'
  );
  shape(scope, PEN).setAttribute('d', 'M51 62.6 L67 62.6 L67 65 L51 65Z');
  pen(scope, PEN * 0.45).setAttribute('d', 'M54.4 62.6 L60 62.6');
  blot(scope).setAttribute('d', 'M59.4 55.6 L62.4 55.6 L61.6 62.2 L60.2 62.2Z');

  {
    const ax = 63.4;
    const ay = 52.6;
    const dx = EYEPIECE[0] - ax;
    const dy = EYEPIECE[1] - ay;
    const l = Math.hypot(dx, dy);
    const nx = (-dy / l) * 1.35;
    const ny = (dx / l) * 1.35;
    shape(scope, PEN).setAttribute(
      'd',
      `M${f(ax + nx)} ${f(ay + ny)} L${f(EYEPIECE[0] + nx)} ${f(EYEPIECE[1] + ny)} ` +
        `L${f(EYEPIECE[0] - nx)} ${f(EYEPIECE[1] - ny)} L${f(ax - nx)} ${f(ay - ny)}Z`
    );
    pen(scope, PEN * 0.6).setAttribute(
      'd',
      `M${f(EYEPIECE[0] + nx * 1.6)} ${f(EYEPIECE[1] + ny * 1.6)} ` +
        `L${f(EYEPIECE[0] - nx * 1.6)} ${f(EYEPIECE[1] - ny * 1.6)}`
    );
  }
  el('circle', {
    cx: 73,
    cy: 62,
    r: 2.5,
    fill: PAPER,
    stroke: 'currentColor',
    'stroke-width': PEN * 0.75,
  }, scope);

  // ── Defter ve kupa: vurgu renginin iki kullanımı ─────────────
  el('path', {
    d: `M80 ${BENCH_TOP - 1.8} L93 ${BENCH_TOP - 1.8} L93 ${BENCH_TOP} L80 ${BENCH_TOP}Z`,
    fill: ACCENT,
    stroke: 'currentColor',
    'stroke-width': PEN * 0.7,
    'stroke-linejoin': 'round',
  }, g);
  pen(g, PEN * 0.45).setAttribute('d', `M82 ${BENCH_TOP - 0.9} L91 ${BENCH_TOP - 0.9}`);

  el('path', {
    d: `M97 ${BENCH_TOP - 6.4} L102.6 ${BENCH_TOP - 6.4} L102 ${BENCH_TOP} L97.6 ${BENCH_TOP}Z`,
    fill: ACCENT,
    stroke: 'currentColor',
    'stroke-width': PEN * 0.7,
    'stroke-linejoin': 'round',
  }, g);
  pen(g, PEN * 0.55).setAttribute(
    'd',
    `M102.6 ${BENCH_TOP - 5.2} Q105.4 ${BENCH_TOP - 4.4} 102.2 ${BENCH_TOP - 2.6}`
  );
  const steam = pen(g, PEN * 0.4);

  return {
    g,
    costume: LAB_COAT,
    pose: 'sit',
    // Baş okülerin hemen solunda; eller odak düğmesinde ve tablada.
    work: {
      head: [EYEPIECE[0] - 4.6, EYEPIECE[1] - 0.4],
      nearHand: [73, 59.5],
      farHand: [57, 64.5],
    },
    width: 120,
    update(t) {
      // Tek sürekli hareket: kupadan yükselen buhar
      const s0: Vec = [99.8, BENCH_TOP - 7.4];
      steam.setAttribute(
        'd',
        `M${pt(s0)} q${f(1.7 + Math.sin(t * 1.4) * 1)} -2.4 0 -4.8 ` +
          `q${f(-1.7 + Math.sin(t * 1.4 + 1.3) * 1)} -2.4 0 -4.8`
      );
      steam.setAttribute('opacity', f(0.42 + Math.sin(t * 0.9) * 0.16));
    },
  };
}
