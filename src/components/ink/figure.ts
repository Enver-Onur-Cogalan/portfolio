/*
  Bant boyunca yürüyen kişi.

  Şeritte tek bir figür var: beş durağın arasında yürüyor, birinde durup
  işini yapıyor, sonra yürümeye devam ediyor. Bu yüzden figür mobilyadan
  ayrı duruyor — duraklar onu bekleyen eşyalar.

  Figür uzayı: ~95 birim boy, ayaklar y=120, x=40'ta durur, +x yönüne bakar.
  Yürüyüş matematiği `gait()`'ten geliyor; bacaklar animasyonla değil
  çözümle hareket ediyor, basılı ayak tam yürüme hızında geride kalıyor.

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
import { spring, type Spring } from '@/lib/ink/motion';

/** Duraklara göre değişen kıyafet. Silüet ve renk değişir, iskelet değişmez. */
export interface Costume {
  /** Giysinin eteği nereye iner: 92 uzun önlük, 78 kısa sweatshirt. */
  hem: number;
  /** Gövde dolgusu: kâğıt (beyaz önlük) ya da düz bir renk. */
  colour?: string;
  /** Kol ağırlığı — paltolu kol biraz kalın. */
  sleeve?: number;
}

export const LAB_COAT: Costume = { hem: 94, sleeve: 3.8 };

export interface Figure {
  g: SVGGElement;
  /**
   * Bir kare yürür ve kendini çizer; kat edilen yatay mesafeyi (yerel
   * birim) döndürür. Mesafe gait'in hızından geliyor — başka bir değerle
   * ilerletilirse basılı ayak kayar.
   *
   * `go` 0'a inince adım yerinde sönüyor ve mesafe de sıfırlanıyor.
   */
  step(dt: number, go?: number): number;
}

export function createFigure(parent: Element, costume: Costume = LAB_COAT): Figure {
  const g = el('g', {}, parent);

  const sleeveW = costume.sleeve ?? 3.6;
  const farArm: Limb = limb(g, sleeveW);
  const legs: [Limb, Limb] = [limb(g, 4.2), limb(g, 4.2)];
  const shoes = [blot(g), blot(g)];
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
    step(dt, go = 1) {
      phase += (dt / walk.period) * go;
      const p = walk.pose(phase, go);
      const b = p.bob;

      // ── Bacaklar; öndeki bacak üstte çizilir ─────────────────
      p.feet.forEach((foot, i) => {
        legs[i].draw([p.hip, foot.knee, foot.ankle], [0.3, 0.8]);
        shoe(shoes[i], foot.ankle, foot.pitch);
      });
      g.insertBefore(legs[p.front].g, garment);
      g.insertBefore(shoes[p.front], garment);

      // ── Giysi: ön kenar öndeki dizin üstünden geçer, etek
      //    adımla açılıp kapanır ─────────────────────────────────
      const sh: Vec = [41, 41 + b];
      const kneeF = p.feet[p.front].knee;
      const ankleF = p.feet[p.front].ankle;
      const hem = costume.hem;
      /*
        Önlük dar bir sütun. Geniş bırakınca kollar siluetin içinde kalıp
        kayboluyor ve figür elbise giymiş gibi duruyor; omuz genişliği
        kadar bir gövde, kolların dışarıda salınmasına yer bırakıyor.
      */
      const fx = Math.max(kneeF[0] + 1.6, 44.6);
      garment.setAttribute(
        'd',
        `M${f(sh[0] - 4.8)} ${f(sh[1] + 1)} Q${f(sh[0] - 1)} ${f(sh[1] - 2.4)} ${f(sh[0] + 4.2)} ${f(sh[1] + 1)} ` +
          `L${f(fx - 0.6)} ${f(hem - 22 + b)} Q${f(fx)} ${f(hem - 10 + b * 0.5)} ${f(Math.max(fx, ankleF[0] - 4))} ${f(hem)} ` +
          `L34.2 ${f(hem + 1)} L35.8 ${f(hem - 22 + b)}Z`
      );
      // Yaka: kısa bir V, gövdeyi baştan ayırıyor
      seam.setAttribute(
        'd',
        `M${f(sh[0] - 2.6)} ${f(sh[1] + 0.4)} L${f(sh[0] + 0.4)} ${f(sh[1] + 5)} L${f(sh[0] + 3.2)} ${f(sh[1] - 0.4)} ` +
          `M${f(sh[0] + 0.6)} ${f(sh[1] + 6)} L${f(sh[0] + 1.6)} ${f(hem - 26 + b)}`
      );

      // ── Baş, saç, sakal ──────────────────────────────────────
      const hc: Vec = [42.6, 31.6 + b];
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
      // Sakal: çene hattında ince bir leke. Büyük çizilince yüzü
      // kaplayıp maske gibi duruyordu.
      beard.setAttribute(
        'd',
        `M${f(hc[0] + 1.4)} ${f(hc[1] + 1.4)} Q${f(hc[0] + 3.2)} ${f(hc[1] + 2)} ${f(hc[0] + 2.2)} ${f(hc[1] + 3.6)} ` +
          `Q${f(hc[0] + 0.8)} ${f(hc[1] + 4.6)} ${f(hc[0] - 0.8)} ${f(hc[1] + 3.8)} ` +
          `Q${f(hc[0] + 0.4)} ${f(hc[1] + 2.8)} ${f(hc[0] + 1.4)} ${f(hc[1] + 1.4)}Z`
      );

      // ── Kollar bacakların tersine salınır, yaylarla gecikir ──
      const legSwing = (p.feet[0].ankle[0] - 40) / (walk.stride / 2);
      const farA = (armSwing[0].step(-legSwing * 20 * go, dt) * Math.PI) / 180;
      const nearA = (armSwing[1].step(legSwing * 18 * go, dt) * Math.PI) / 180;
      // Kollar gövdenin kenarının hemen dışına asılıyor. İçeride kalınca
      // önlüğün ön dikişiyle çakışıp görünmez oluyorlardı.
      const shF: Vec = [sh[0] - 4, sh[1] + 2.2];
      const shN: Vec = [sh[0] + 4.6, sh[1] + 2.6];
      const elbF: Vec = [shF[0] + 17 * Math.sin(farA), shF[1] + 17 * Math.cos(farA)];
      farArm.draw(
        [shF, elbF, [elbF[0] + 16 * Math.sin(farA + 0.25), elbF[1] + 16 * Math.cos(farA + 0.25)]],
        [0.2, 0.5]
      );
      const elbN: Vec = [shN[0] + 17 * Math.sin(nearA), shN[1] + 17 * Math.cos(nearA)];
      nearArm.draw(
        [shN, elbN, [elbN[0] + 16 * Math.sin(nearA + 0.1), elbN[1] + 16 * Math.cos(nearA + 0.1)]],
        [0.2, 0.4]
      );

      return walk.speed * dt * go;
    },
  };
}
