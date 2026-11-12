/*
  Durak 4 — motosiklet.

  Şeridin tek "mobilyası olmayan" durağı: oturulan şey bir sele.
  Sele yüksekliği diğer durakların taburesiyle aynı hizada (y≈85), çünkü
  figürün oturma pozu tek: kalça SIT_HIP'e gidiyor. Böylece oturma
  geçişi burada "motora binmek" olarak okunuyor, ayrı bir animasyon
  gerekmiyor.

  İlk çizim bisiklet gibi okunuyordu: tekerlekler büyük, gövde ince.
  Motosiklet yapan şey oran — küçük ve kalın tekerlek, selenin altını
  dolduran motor bloğu, arkaya süpüren egzoz ve geniş depo.

  Gidon bilerek sürücüye yakın. Omuzlar oturuşta [43.4, 56.6] ve
  [52, 57]; kol 33 birim. Kabzayı gerçek bir motosiklette olduğu gibi
  ön çatalın tepesine koyunca uzak el 37 birim öteye düşüyor ve o kol
  geriliyordu. Buradaki yer iki omuzdan da erişilebiliyor (20 ve 29
  birim), iki dirsek de bükülü kalıyor — sürücü duruşu da zaten bu.

  Yerel uzay figürle ortak: zemin y=120, figür x=40'ta.
*/
import { blot, el, f, pen, shape, PEN, PAPER, type Vec } from '@/lib/ink/ink';
import { BIKER, type Costume, type WorkPose } from '../figure';
import type { Station } from './microscope';

const R = 13.5;
const REAR: Vec = [17, 106.5];
const FRONT: Vec = [83, 106.5];
/** Direksiyon boynunun tepesi. */
const NECK: Vec = [74, 72];
/** Gidon kabzası — iki elin de gittiği yer. */
const GRIP: Vec = [71, 64.5];

/** Tekerlek: kalın lastik, jant, sabit parmaklıklar, göbek. */
function wheel(parent: Element, c: Vec): void {
  el('circle', {
    cx: c[0], cy: c[1], r: R,
    fill: 'none', stroke: 'currentColor', 'stroke-width': PEN * 1.9,
  }, parent);
  el('circle', {
    cx: c[0], cy: c[1], r: R - 3.2,
    fill: 'none', stroke: 'currentColor', 'stroke-width': PEN * 0.5,
  }, parent);
  // Duran motosiklet: parmaklıklar sabit, dönmüyor.
  const d: string[] = [];
  for (let k = 0; k < 4; k++) {
    const a = 0.4 + (k * Math.PI) / 4;
    const rr = R - 3.2;
    d.push(
      `M${f(c[0] + Math.cos(a) * rr)} ${f(c[1] + Math.sin(a) * rr)} ` +
        `L${f(c[0] - Math.cos(a) * rr)} ${f(c[1] - Math.sin(a) * rr)}`
    );
  }
  pen(parent, PEN * 0.35).setAttribute('d', d.join(' '));
  el('circle', { cx: c[0], cy: c[1], r: 2.2, fill: 'currentColor' }, parent);
}

export function bikeStation(parent: Element): Station {
  const g = el('g', {}, parent);

  wheel(g, REAR);
  wheel(g, FRONT);

  /*
    Çamurluklar. Kuadratik yayın tepesi kontrol noktasının yarı
    yüksekliğinde kalıyor: kontrol lastiğin üstüne konunca yay lastiğin
    İÇİNDEN geçip görünmez oluyordu. Kontrol, istenen tepenin iki katı
    kadar yukarıda.
  */
  pen(g, PEN * 1.1).setAttribute(
    'd',
    `M${REAR[0] - 15} ${REAR[1] - 4} Q${REAR[0] - 1} ${REAR[1] - 32} ${REAR[0] + 14} ${REAR[1] - 7} ` +
      `M${FRONT[0] - 14} ${FRONT[1] - 7} Q${FRONT[0]} ${FRONT[1] - 33} ${FRONT[0] + 14} ${FRONT[1] - 5}`
  );

  // ── Şasi ─────────────────────────────────────────────────────
  pen(g, PEN * 1.1).setAttribute(
    'd',
    `M${REAR[0]} ${REAR[1]} L44 100 ` + // salıncak
      `M${NECK[0]} ${NECK[1]} L62 94 ` + // ön iniş borusu
      `M${NECK[0]} ${NECK[1]} L50 80 ` + // üst boru
      `M50 86 L45 99` // sele altı
  );
  // Arka amortisör
  pen(g, PEN * 1.3).setAttribute('d', 'M45 99 L49 86');

  // ── Motor bloğu: selenin altını dolduran kütle ───────────────
  shape(g, PEN * 0.95).setAttribute('d', 'M50 89 L67 87 L69 100 L51 102Z');
  pen(g, PEN * 0.45).setAttribute(
    'd',
    'M51 91.6 L67.4 89.8 M51.4 94.6 L67.9 92.8 M51.8 97.6 L68.4 95.8'
  );

  // ── Egzoz: motordan arkaya süpüren kalın boru ────────────────
  pen(g, PEN * 1.2).setAttribute('d', 'M67 97 Q50 105 36 103');
  pen(g, PEN * 2.2).setAttribute('d', `M36 103 L${REAR[0] + 7} 102`);

  // ── Sele ─────────────────────────────────────────────────────
  shape(g, PEN).setAttribute('d', 'M23 84 Q28 81.4 36 82.4 L50 84 L49.4 88.4 L24.2 88.6Z');

  // ── Depo: şeridin yeşili burada da ───────────────────────────
  el('path', {
    d: `M50 85.6 L50.6 79 Q56 74.4 65 74.2 L${NECK[0] - 0.6} 75.4 L72.4 85.4Z`,
    fill: 'var(--accent)',
    stroke: 'currentColor',
    'stroke-width': PEN * 0.9,
    'stroke-linejoin': 'round',
  }, g);

  // ── Ön çatal ─────────────────────────────────────────────────
  pen(g, PEN * 1.15).setAttribute(
    'd',
    `M${NECK[0] - 0.8} ${NECK[1]} L${FRONT[0] - 1} ${FRONT[1]} M${NECK[0] + 1.8} ${NECK[1] + 0.4} L${FRONT[0] + 1.8} ${FRONT[1]}`
  );

  // ── Far: çatalın önüne oturan yuvarlak ───────────────────────
  el('path', {
    d: 'M74.8 67 Q81 65.8 81.8 71 Q82.2 76.4 76.2 76.6 Q73 73.8 74.8 67Z',
    fill: PAPER,
    stroke: 'currentColor',
    'stroke-width': PEN * 0.9,
    'stroke-linejoin': 'round',
  }, g);
  pen(g, PEN * 0.4).setAttribute('d', 'M76.4 69 Q79.4 68.4 80 71.2');

  // ── Gidon ────────────────────────────────────────────────────
  pen(g, PEN * 0.95).setAttribute(
    'd',
    `M${NECK[0] + 0.4} ${NECK[1] - 0.6} L74.6 66.6 Q74 64.6 ${GRIP[0] + 1.4} ${GRIP[1] - 0.4}`
  );
  // Kabza: gidonun ucundaki kısa kalın parça
  pen(g, PEN * 1.8).setAttribute(
    'd',
    `M${GRIP[0] + 1.6} ${GRIP[1] - 0.4} L${GRIP[0] - 2.4} ${GRIP[1] + 0.6}`
  );

  // ── Basamak ve ayaklık ───────────────────────────────────────
  blot(g).setAttribute('d', 'M51.4 102.6 L58 101.8 L58.2 103.4 L51.6 104.2Z');
  // Yan sehpa: motorun park hâlinde olduğunu söyleyen tek ayrıntı
  pen(g, PEN * 0.9).setAttribute('d', 'M46 101 L38.6 118');

  return {
    g,
    costume: BIKER as Costume,
    pose: 'sit',
    /*
      İki el de gidonda. Yan görünüşte iki kabza üst üste; uzak el
      hafifçe geride ve aşağıda duruyor ki kollar tek kalın çizgi
      hâlinde birleşmesin.
    */
    work: {
      head: [48.2, 43.4],
      nearHand: GRIP,
      farHand: [GRIP[0] - 3, GRIP[1] + 2],
    } satisfies WorkPose,
    // İkinci poz: gaz kolunu çevirip yola bakıyor.
    workAlt: {
      head: [49.2, 42.2],
      nearHand: [GRIP[0] + 0.8, GRIP[1] + 1.4],
      farHand: [GRIP[0] - 3, GRIP[1] + 2],
    } satisfies WorkPose,
    legsBehind: true,
    width: 130,
    update() {
      // Duran motosiklet: hareketli parçası yok.
    },
  };
}
