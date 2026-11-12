/*
  Bant boyunca yürüyen kişi.

  Şeritte tek bir figür var: beş durağın arasında yürüyor, birinde durup
  işini yapıyor, sonra yürümeye devam ediyor. Bu yüzden figür mobilyadan
  ayrı duruyor — duraklar onu bekleyen eşyalar.

  Figür uzayı: ~95 birim boy, ayaklar y=120, x=40'ta durur, +x yönüne bakar.
  Yürüyüş `gait()` ile çözülüyor; bacaklar animasyonla değil mekanikle
  hareket ediyor, basılı ayak tam yürüme hızında geride kalıyor.

  Oturma ayrı bir poz değil, aynı iskeletin harmanlanmış hâli: `sit` 0'dan
  1'e giderken kalça, dizler, bilekler, omuz ve baş ayakta duruş ile oturuş
  hedefleri arasında geçiyor. Böylece oturup kalkma tek bir sayıyla
  sürülebiliyor ve ara karelerde de tutarlı kalıyor.

  Kostüm her durakta değişiyor ama iskelet aynı: saç ve sakal hiç
  değişmediği için beş hâlde de aynı kişi okunuyor.
*/
import {
  blot,
  el,
  f,
  limb,
  pen,
  shape,
  shoe,
  PEN,
  PAPER,
  type Limb,
  type Vec,
} from '@/lib/ink/ink';
import { gait, type Gait } from '@/lib/ink/gait';
import { clamp, lerp, spring, type Spring } from '@/lib/ink/motion';

/** Duraklara göre değişen kıyafet. Silüet ve renk değişir, iskelet değişmez. */
export interface Costume {
  /** Giysinin eteği nereye iner: 94 uzun önlük, 78 kısa sweatshirt. */
  hem: number;
  /** Gövde dolgusu: verilmezse kâğıt (beyaz önlük). */
  colour?: string;
  /** Kol kalınlığı — paltolu kol biraz kalın. */
  sleeve?: number;
}

export const LAB_COAT: Costume = { hem: 94, sleeve: 3.8 };

/** Figürün oturduğunda ellerini ve başını götüreceği yerler. */
export interface WorkPose {
  nearHand: Vec;
  farHand: Vec;
  /** Başın merkezi — mikroskopta oküllerin hemen solu. */
  head: Vec;
}

export interface FigureState {
  /** 0 durdu, 1 tam yürüyor. Aradaki değerler adımı yerinde söndürüyor. */
  go: number;
  /** 0 ayakta, 1 oturmuş. */
  sit: number;
  /** Oturunca ellerin ve başın gideceği yerler. */
  work?: WorkPose;
}

export interface Figure {
  g: SVGGElement;
  /** Bir kare çizer; kat edilen yatay mesafeyi (yerel birim) döndürür. */
  update(dt: number, state: FigureState): number;
}

const UPPER_ARM = 17;
const FOREARM = 16;

const mix = (a: Vec, b: Vec, u: number): Vec => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

/**
 * Dirsek: iki kemikli IK, çözüm tarafı açıkça seçiliyor (`side = +1` dirseği
 * aşağı düşürür). Sonuç doğruya doğru biraz geri çekiliyor çünkü `limb()`
 * orta noktayı kuadratik kontrol noktası olarak alıp sapmayı 1.55 katına
 * çıkarıyor — ham dirsek verilirse kol muz gibi şişiyor.
 */
function elbow(a: Vec, b: Vec, side: 1 | -1 = 1): Vec {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const d = Math.min(Math.hypot(dx, dy), UPPER_ARM + FOREARM - 0.01) || 0.01;
  const th = Math.atan2(dy, dx);
  const cosAl = clamp(
    (UPPER_ARM * UPPER_ARM + d * d - FOREARM * FOREARM) / (2 * UPPER_ARM * d),
    -1,
    1
  );
  const ang = th + Math.acos(cosAl) * side;
  const e: Vec = [a[0] + UPPER_ARM * Math.cos(ang), a[1] + UPPER_ARM * Math.sin(ang)];
  return mix([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], e, 0.55);
}

/* Oturuş hedefleri. Tabure yüksekliği duraklarla ortak (SEAT = 88). */
const SIT_HIP: Vec = [34, 85];
const SIT_KNEE_NEAR: Vec = [53, 88];
const SIT_KNEE_FAR: Vec = [49.5, 89];
const SIT_ANKLE_NEAR: Vec = [56, 116];
const SIT_ANKLE_FAR: Vec = [45.5, 116];
const SIT_LEAN = (25 * Math.PI) / 180;

export function createFigure(parent: Element, costume: Costume = LAB_COAT): Figure {
  const g = el('g', {}, parent);

  const sleeveW = costume.sleeve ?? 3.6;
  const farArm: Limb = limb(g, sleeveW);
  const farLeg: Limb = limb(g, 4.2);
  const farShoe = blot(g);
  const nearLeg: Limb = limb(g, 4.2);
  const nearShoe = blot(g);
  const garment = costume.colour
    ? el('path', {
        fill: costume.colour,
        stroke: 'currentColor',
        'stroke-width': PEN,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
      }, g)
    : shape(g);
  const seam = pen(g, PEN * 0.55);
  const neck = pen(g, PEN * 0.75);
  const head = el('ellipse', {
    rx: 3.7,
    ry: 4.7,
    fill: PAPER,
    stroke: 'currentColor',
    'stroke-width': PEN,
  }, g);
  const hair = blot(g);
  const beard = blot(g);
  const nearArm: Limb = limb(g, sleeveW);

  const walk: Gait = gait({ kind: 'walk' });
  const armSwing: [Spring, Spring] = [spring(60, 9), spring(60, 9)];
  let phase = 0;

  return {
    g,
    update(dt, state) {
      const go = clamp(state.go, 0, 1);
      const sit = clamp(state.sit, 0, 1);
      phase += (dt / walk.period) * go;

      const p = walk.pose(phase, go);
      const b = p.bob;
      const back: 0 | 1 = p.front === 0 ? 1 : 0;

      // ── Eklemler: ayakta duruş ile oturuş arasında harmanlanıyor ──
      const hip = mix(p.hip, SIT_HIP, sit);
      const kneeN = mix(p.feet[p.front].knee, SIT_KNEE_NEAR, sit);
      const ankleN = mix(p.feet[p.front].ankle, SIT_ANKLE_NEAR, sit);
      const kneeF = mix(p.feet[back].knee, SIT_KNEE_FAR, sit);
      const ankleF = mix(p.feet[back].ankle, SIT_ANKLE_FAR, sit);

      // Omuz: ayaktayken yürüyüş örneğindeki sabit nokta, otururken
      // kalçadan öne eğilmiş gövdenin ucu.
      const standSh: Vec = [41, 41 + b];
      const sitSh: Vec = [
        SIT_HIP[0] + 32 * Math.sin(SIT_LEAN),
        SIT_HIP[1] - 32 * Math.cos(SIT_LEAN),
      ];
      const sh = mix(standSh, sitSh, sit);

      const standHead: Vec = [42.6, 31.6 + b];
      const sitHead: Vec = state.work
        ? state.work.head
        : [sitSh[0] + 5.2 * Math.sin(SIT_LEAN) + 1.4, sitSh[1] - 10.2 * Math.cos(SIT_LEAN)];
      const hc = mix(standHead, sitHead, sit);

      // ── Bacaklar; öndeki bacak üstte ─────────────────────────
      farLeg.draw([hip, kneeF, ankleF], [0.3, 0.8]);
      shoe(farShoe, ankleF, lerp(p.feet[back].pitch, -3, sit));
      nearLeg.draw([hip, kneeN, ankleN], [0.3, 0.8]);
      shoe(nearShoe, ankleN, lerp(p.feet[p.front].pitch, -3, sit));

      // ── Giysi ────────────────────────────────────────────────
      /*
        Dar bir sütun. Geniş bırakınca kollar siluetin içinde kalıp
        kayboluyor ve figür elbise giymiş gibi duruyor.
      */
      /*
        Otururken etek koltuk hizasında bitiyor. Ayaktaki boyunda
        bırakılınca tabureyi ve baldırları tamamen örtüyor, figürün
        oturduğu anlaşılmıyordu.
      */
      const hem = lerp(costume.hem, 89, sit);
      const fx = Math.max(kneeN[0] + 1.6, 44.6);
      garment.setAttribute(
        'd',
        `M${f(sh[0] - 4.8)} ${f(sh[1] + 1)} Q${f(sh[0] - 1)} ${f(sh[1] - 2.4)} ${f(sh[0] + 4.2)} ${f(sh[1] + 1)} ` +
          `L${f(fx - 0.6)} ${f(hem - 22 + b)} Q${f(fx)} ${f(hem - 10 + b * 0.5)} ${f(Math.max(fx, ankleN[0] - 4))} ${f(hem)} ` +
          `L${f(lerp(34.2, hip[0] - 10, sit))} ${f(hem + 1)} ` +
          `L${f(lerp(35.8, hip[0] - 9, sit))} ${f(hem - 22 + b)}Z`
      );
      seam.setAttribute(
        'd',
        `M${f(sh[0] - 2.6)} ${f(sh[1] + 0.4)} L${f(sh[0] + 0.4)} ${f(sh[1] + 5)} L${f(sh[0] + 3.2)} ${f(sh[1] - 0.4)} ` +
          `M${f(sh[0] + 0.6)} ${f(sh[1] + 6)} L${f(sh[0] + 1.6)} ${f(hem - 26 + b)}`
      );

      // ── Baş, saç, sakal ──────────────────────────────────────
      head.setAttribute('cx', f(hc[0]));
      head.setAttribute('cy', f(hc[1]));
      neck.setAttribute(
        'd',
        `M${f(hc[0] - 2.2)} ${f(hc[1] + 4.2)} L${f(sh[0] - 1.4)} ${f(sh[1] - 0.6)} ` +
          `M${f(hc[0] + 1.6)} ${f(hc[1] + 4.4)} L${f(sh[0] + 2.4)} ${f(sh[1] - 0.4)}`
      );
      hair.setAttribute(
        'd',
        `M${f(hc[0] - 4.1)} ${f(hc[1] - 1.3)} Q${f(hc[0] - 4.5)} ${f(hc[1] - 6.3)} ${f(hc[0] + 0.5)} ${f(hc[1] - 5.2)} ` +
          `Q${f(hc[0] + 3.7)} ${f(hc[1] - 4.4)} ${f(hc[0] + 3.5)} ${f(hc[1] - 2.5)} ` +
          `Q${f(hc[0] + 1.3)} ${f(hc[1] - 3.9)} ${f(hc[0] - 1.7)} ${f(hc[1] - 3.2)} ` +
          `Q${f(hc[0] - 3.4)} ${f(hc[1] - 2.8)} ${f(hc[0] - 4.1)} ${f(hc[1] - 1.3)}Z`
      );
      // Sakal: çene hattında ince bir leke. Büyük çizilince yüzü kaplayıp
      // maske gibi duruyordu.
      beard.setAttribute(
        'd',
        `M${f(hc[0] + 1.4)} ${f(hc[1] + 1.4)} Q${f(hc[0] + 3.2)} ${f(hc[1] + 2)} ${f(hc[0] + 2.2)} ${f(hc[1] + 3.6)} ` +
          `Q${f(hc[0] + 0.8)} ${f(hc[1] + 4.6)} ${f(hc[0] - 0.8)} ${f(hc[1] + 3.8)} ` +
          `Q${f(hc[0] + 0.4)} ${f(hc[1] + 2.8)} ${f(hc[0] + 1.4)} ${f(hc[1] + 1.4)}Z`
      );

      // ── Kollar ───────────────────────────────────────────────
      // Kollar gövdenin kenarının hemen dışına asılıyor; içeride kalınca
      // giysinin ön dikişiyle çakışıp görünmez oluyorlar.
      const shF: Vec = [sh[0] - 4, sh[1] + 2.2];
      const shN: Vec = [sh[0] + 4.6, sh[1] + 2.6];

      const legSwing = (p.feet[0].ankle[0] - 40) / (walk.stride / 2);
      const farA = (armSwing[0].step(-legSwing * 20 * go, dt) * Math.PI) / 180;
      const nearA = (armSwing[1].step(legSwing * 18 * go, dt) * Math.PI) / 180;

      const farElbStand: Vec = [shF[0] + 17 * Math.sin(farA), shF[1] + 17 * Math.cos(farA)];
      const farHandStand: Vec = [
        farElbStand[0] + 16 * Math.sin(farA + 0.25),
        farElbStand[1] + 16 * Math.cos(farA + 0.25),
      ];
      const nearElbStand: Vec = [shN[0] + 17 * Math.sin(nearA), shN[1] + 17 * Math.cos(nearA)];
      const nearHandStand: Vec = [
        nearElbStand[0] + 16 * Math.sin(nearA + 0.1),
        nearElbStand[1] + 16 * Math.cos(nearA + 0.1),
      ];

      if (state.work && sit > 0.001) {
        const nearHand = mix(nearHandStand, state.work.nearHand, sit);
        const farHand = mix(farHandStand, state.work.farHand, sit);
        farArm.draw([shF, elbow(shF, farHand), farHand], [0.2, 0.5]);
        nearArm.draw([shN, elbow(shN, nearHand), nearHand], [0.2, 0.45]);
      } else {
        farArm.draw([shF, farElbStand, farHandStand], [0.2, 0.5]);
        nearArm.draw([shN, nearElbStand, nearHandStand], [0.2, 0.45]);
      }

      return walk.speed * dt * go;
    },
  };
}
