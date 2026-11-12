/*
  Durak 3 — kahve molası.

  İki iş durağının arasında nefes alınan yer. Kupa şeridin her durağında
  masada duran nesne; burada elde, yani motifin karşılığı bu sahnede
  veriliyor. Kupa figürün eline bağlı (`prop`), durağın içine konmuyor:
  sabit bir noktaya konunca el ona yumuşayarak gittiği için nesne havada
  asılı kalıyor.

  Yuvarlak ayaklı küçük bir masa, diğer durakların ayaklı tezgâhlarından
  bilerek farklı bir siluet.
*/
import { el, f, pen, shape, PEN } from '@/lib/ink/ink';
import { TEE, type Costume, type WorkPose } from '../figure';
import type { Station } from './microscope';

const TABLE_TOP = 80;
const SEAT = 88;

export function coffeeStation(parent: Element): Station {
  const g = el('g', {}, parent);

  // ── Tabure ───────────────────────────────────────────────────
  shape(g, PEN * 0.9).setAttribute('d', `M22 ${SEAT} L48 ${SEAT} L48 ${SEAT + 3} L22 ${SEAT + 3}Z`);
  pen(g, PEN * 0.6).setAttribute('d', `M26 ${SEAT + 3} L24 120 M44 ${SEAT + 3} L46 120`);

  // ── Yuvarlak ayaklı masa ─────────────────────────────────────
  shape(g, PEN).setAttribute(
    'd',
    `M58 ${TABLE_TOP} L92 ${TABLE_TOP} L92 ${TABLE_TOP + 3} L58 ${TABLE_TOP + 3}Z`
  );
  pen(g, PEN * 0.8).setAttribute('d', `M72 ${TABLE_TOP + 3} L72 115 M78 ${TABLE_TOP + 3} L78 115`);
  shape(g, PEN * 0.8).setAttribute('d', 'M64 115 L86 115 L84 119 L66 119Z');

  // ── Masadaki ufak şeyler: tabak ve açık bir defter ───────────
  shape(g, PEN * 0.7).setAttribute('d', `M60 ${TABLE_TOP - 1.6} L70 ${TABLE_TOP - 1.6} L70 ${TABLE_TOP} L60 ${TABLE_TOP}Z`);
  pen(g, PEN * 0.45).setAttribute(`d`, `M62 ${TABLE_TOP - 0.8} L68 ${TABLE_TOP - 0.8}`);
  pen(g, PEN * 0.5).setAttribute('d', `M82 ${TABLE_TOP} L82 ${TABLE_TOP - 2.4} L89 ${TABLE_TOP - 2.4} L89 ${TABLE_TOP}`);

  // ── Fincandan yükselen buhar ─────────────────────────────────
  const steam = pen(g, PEN * 0.4);

  return {
    g,
    costume: TEE as Costume,
    pose: 'sit',
    work: {
      // Kupa ağza yakın, uzak el masada; baş hafifçe geriye
      head: [45.6, 42.4],
      nearHand: [49.6, 48.6],
      farHand: [62, 77],
    } satisfies WorkPose,
    prop: 'mug',
    width: 110,
    update(t) {
      // Buhar elde tutulan kupanın üstünde değil, masadaki tabağın
      // yanından yükseliyor — kupa figürle birlikte hareket ettiği için
      // buharı ona bağlamak sahneyi karıştırırdı.
      steam.setAttribute(
        'd',
        `M65 ${TABLE_TOP - 2.4} q${f(1.5 + Math.sin(t * 1.3) * 0.9)} -2.2 0 -4.4 ` +
          `q${f(-1.5 + Math.sin(t * 1.3 + 1.2) * 0.9)} -2.2 0 -4.4`
      );
      steam.setAttribute('opacity', f(0.34 + Math.sin(t * 0.8) * 0.14));
    },
  };
}
