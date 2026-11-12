/*
  Durak 2 — masa, dizüstü ve sandalye.

  Yalnızca mobilya. Yerel uzay figürünkiyle aynı (zemin y=120) ve oturak
  yüksekliği laboratuvar taburesiyle ortak (88), böylece aynı oturuş
  harmanı burada da tutuyor.
*/
import { el, f, pen, shape, PEN, type Vec } from '@/lib/ink/ink';
import { HOODIE, type Costume, type WorkPose } from '../figure';
import type { Station } from './microscope';

const DESK_TOP = 72;
const SEAT = 88;

export function deskStation(parent: Element): Station {
  const g = el('g', {}, parent);

  // ── Sandalye: arkalıklı, masa durağını tabureden ayırıyor ────
  shape(g, PEN * 0.9).setAttribute('d', `M18 ${SEAT} L48 ${SEAT} L48 ${SEAT + 3} L18 ${SEAT + 3}Z`);
  /*
    Arkalık: iki dikme ve aralarında iki yatay kayıt. Tek çizgi olarak
    çizilince bayrak direği gibi duruyordu; sandalyeyi tabureden ayıran
    şey tam da bu parça olduğu için okunur olmalı.
  */
  pen(g, PEN * 0.7).setAttribute(
    'd',
    `M20.5 ${SEAT} L18.5 58 M28 ${SEAT} L26.6 58 M18.2 61 L26.8 61 M18.8 68 L27.4 68`
  );
  pen(g, PEN * 0.6).setAttribute('d', `M22 ${SEAT + 3} L20 120 M44 ${SEAT + 3} L46 120 M22 106 L44 106`);

  // ── Masa ─────────────────────────────────────────────────────
  shape(g, PEN).setAttribute(
    'd',
    `M48 ${DESK_TOP} L108 ${DESK_TOP} L108 ${DESK_TOP + 3.4} L48 ${DESK_TOP + 3.4}Z`
  );
  pen(g, PEN * 0.55).setAttribute('d', `M102 ${DESK_TOP + 3.4} L103 120`);
  pen(g, PEN * 0.45).setAttribute('d', `M72 100 L101 100`);

  // ── Dizüstü ──────────────────────────────────────────────────
  /*
    Ekran figüre dönük olmalı: figür +x yönüne baktığı için ekran sola
    bakar, yani menteşeden sağa doğru yatar. Taban ile ekran ayrı
    parçalar; aradaki menteşe çizgisi ikisini birbirine bağlıyor.
  */
  const base = shape(g, PEN);
  base.setAttribute('d', `M52 ${DESK_TOP} L74 ${DESK_TOP} L76 ${DESK_TOP - 2.4} L54 ${DESK_TOP - 2.4}Z`);
  pen(g, PEN * 0.4).setAttribute('d', `M57 ${DESK_TOP - 1.2} L72 ${DESK_TOP - 1.2}`); // klavye

  const screen = shape(g, PEN);
  screen.setAttribute('d', `M75 ${DESK_TOP - 2.4} L82.6 50.6 L86 51.4 L78.4 ${DESK_TOP - 1.8}Z`);
  // Ekranın parlayan yüzü: kâğıt dolgusu, figüre bakan tarafta
  const glow = el('path', {
    d: `M76.4 ${DESK_TOP - 3.4} L83 52.4 L84.6 52.8 L78 ${DESK_TOP - 3}Z`,
    // Ekran geceleyin kararmaz, yanar: rengi banttan geliyor.
    fill: 'var(--screen)',
    stroke: 'none',
  }, g);

  // ── Kupa: her durakta tekrar eden nesne ──────────────────────
  el('path', {
    d: `M94 ${DESK_TOP - 6.4} L99.6 ${DESK_TOP - 6.4} L99 ${DESK_TOP} L94.6 ${DESK_TOP}Z`,
    fill: 'var(--accent)',
    stroke: 'currentColor',
    'stroke-width': PEN * 0.7,
    'stroke-linejoin': 'round',
  }, g);
  pen(g, PEN * 0.55).setAttribute(
    'd',
    `M99.6 ${DESK_TOP - 5.2} Q102.4 ${DESK_TOP - 4.4} 99.2 ${DESK_TOP - 2.6}`
  );

  // ── Ekranın titreşimi: tek sürekli hareket ───────────────────
  return {
    g,
    costume: HOODIE as Costume,
    pose: 'sit',
    label: 'Kod yazarken',
    work: {
      // Baş ekrana bakacak şekilde öne eğik, eller klavyede
      head: [50, 47.5],
      nearHand: [66, 69.5],
      farHand: [59, 70.5],
    } satisfies WorkPose,
    width: 120,
    update(t) {
      // Ekran ışığı hafifçe soluyor; yazarken ekran değişiyor demek
      glow.setAttribute('opacity', f(0.72 + Math.sin(t * 2.3) * 0.12));
    },
  };
}

export type { Vec };
