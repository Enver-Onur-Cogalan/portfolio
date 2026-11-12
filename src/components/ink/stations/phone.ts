/*
  Durak 3 — telefonundaki uygulamaya bakıyor.

  Bu durakta oturulmuyor: ayakta durup telefonu kaldırıyor. Beş durağın
  hepsinde oturulsa bant monotonlaşırdı; ayrıca telefona bakmak zaten
  ayakta yapılan bir şey.

  Mobilya olarak alçak bir sehpa var: üstünde saksı ve kupa. Durağı boş
  bırakmamak için, figürle yarışmayacak kadar alçak.
*/
import { el, f, pen, shape, PEN, PAPER, type Vec } from '@/lib/ink/ink';
import { TEE, type Costume, type WorkPose } from '../figure';
import type { Station } from './microscope';

const TABLE_TOP = 92;

export function phoneStation(parent: Element): Station {
  const g = el('g', {}, parent);

  // ── Alçak sehpa ──────────────────────────────────────────────
  shape(g, PEN).setAttribute(
    'd',
    `M62 ${TABLE_TOP} L96 ${TABLE_TOP} L96 ${TABLE_TOP + 3} L62 ${TABLE_TOP + 3}Z`
  );
  pen(g, PEN * 0.6).setAttribute('d', `M66 ${TABLE_TOP + 3} L64 120 M92 ${TABLE_TOP + 3} L94 120`);

  // ── Saksı ve bitki ───────────────────────────────────────────
  shape(g, PEN * 0.9).setAttribute('d', `M70 ${TABLE_TOP} L80 ${TABLE_TOP} L78.6 ${TABLE_TOP - 7} L71.4 ${TABLE_TOP - 7}Z`);
  pen(g, PEN * 0.6).setAttribute('d', `M71 ${TABLE_TOP - 7} L79 ${TABLE_TOP - 7}`);
  // Yapraklar: üç açık kalem darbesi, hepsi eğri
  const leaves = pen(g, PEN * 0.7);
  leaves.setAttribute(
    'd',
    `M75 ${TABLE_TOP - 7} Q73.4 ${TABLE_TOP - 15} 69 ${TABLE_TOP - 18} ` +
      `M75.2 ${TABLE_TOP - 7} Q76.6 ${TABLE_TOP - 16} 75.4 ${TABLE_TOP - 22} ` +
      `M75.4 ${TABLE_TOP - 7} Q78.4 ${TABLE_TOP - 14} 82 ${TABLE_TOP - 17}`
  );

  // ── Kupa: her durakta tekrar eden nesne ──────────────────────
  el('path', {
    d: `M86 ${TABLE_TOP - 6.4} L91.6 ${TABLE_TOP - 6.4} L91 ${TABLE_TOP} L86.6 ${TABLE_TOP}Z`,
    fill: '#2e8f63',
    stroke: 'currentColor',
    'stroke-width': PEN * 0.7,
    'stroke-linejoin': 'round',
  }, g);
  pen(g, PEN * 0.55).setAttribute(
    'd',
    `M91.6 ${TABLE_TOP - 5.2} Q94.4 ${TABLE_TOP - 4.4} 91.2 ${TABLE_TOP - 2.6}`
  );

  /*
    Telefon figürün elinde, yani figürle birlikte çizilmesi gerekir ama
    uzuvlar figür modülünde. Burada sahneye değil, durağın en önüne
    konuyor: figür durakta dururken tam elinin olduğu yere denk geliyor.
  */
  const PHONE: Vec = [53, 57];
  const phone = shape(g, PEN * 0.8);
  phone.setAttribute(
    'd',
    `M${PHONE[0] - 2.4} ${PHONE[1] - 5} L${PHONE[0] + 2.4} ${PHONE[1] - 4.2} ` +
      `L${PHONE[0] + 1.6} ${PHONE[1] + 5} L${PHONE[0] - 3.2} ${PHONE[1] + 4.2}Z`
  );
  const glow = el('path', {
    d:
      `M${PHONE[0] - 1.8} ${PHONE[1] - 4} L${PHONE[0] + 1.8} ${PHONE[1] - 3.4} ` +
      `L${PHONE[0] + 1.1} ${PHONE[1] + 3.6} L${PHONE[0] - 2.5} ${PHONE[1] + 3}Z`,
    fill: PAPER,
    stroke: 'none',
  }, g);
  glow.classList.add('pp');

  return {
    g,
    costume: TEE as Costume,
    pose: 'stand',
    work: {
      // Baş telefona eğik; yakın el telefonu tutuyor, uzak el yanda
      head: [44.6, 34.6],
      nearHand: [PHONE[0] - 1, PHONE[1] + 4.6],
      farHand: [37, 72],
    } satisfies WorkPose,
    width: 110,
    update(t) {
      // Ekran uygulamada bir şey oluyormuş gibi hafifçe değişiyor
      glow.setAttribute('opacity', f(0.68 + Math.sin(t * 1.9) * 0.16));
    },
  };
}
