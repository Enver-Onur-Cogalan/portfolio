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
import { el, f, pen, shape, PEN, type Vec } from '@/lib/ink/ink';
import { ACCENT, TEE, type Costume, type WorkPose } from '../figure';
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

  /*
    Masadaki ufak şeyler masanın sağ yarısında toplanıyor: sol ön köşe
    boş kalsın ki sol kol oraya yayılabilsin.
  */
  shape(g, PEN * 0.7).setAttribute('d', `M77 ${TABLE_TOP - 1.6} L85 ${TABLE_TOP - 1.6} L85 ${TABLE_TOP} L77 ${TABLE_TOP}Z`);
  pen(g, PEN * 0.45).setAttribute('d', `M79 ${TABLE_TOP - 0.8} L83 ${TABLE_TOP - 0.8}`);

  /*
    Masadaki kupa. Figür onu eline aldığında gizleniyor; figürün elindeki
    kupa tam bu noktada başladığı için geçiş görünmüyor.
  */
  const MUG: Vec = [70, 78.6];
  /*
    Sol elin masadaki yeri. Kol omuzdan 33 birim; önceki hedef masanın öbür
    ucundaydı (omuzdan 45 birim) ve kol gerilip düz bir çubuğa dönüyordu.
    Burası omuzdan 28 birim: dirsek bükülü kalıyor, el masaya yayılıyor.
  */
  const FAR_REST: Vec = [59.4, 80.2];
  const tableMug = el('g', {}, g);
  el('path', {
    d:
      `M${MUG[0] - 2.6} ${MUG[1] - 3.4} L${MUG[0] + 2.4} ${MUG[1] - 3.4} ` +
      `L${MUG[0] + 1.9} ${MUG[1] + 1.4} L${MUG[0] - 2.1} ${MUG[1] + 1.4}Z`,
    fill: ACCENT,
    stroke: 'currentColor',
    'stroke-width': PEN * 0.7,
    'stroke-linejoin': 'round',
  }, tableMug);
  pen(tableMug, PEN * 0.55).setAttribute(
    'd',
    `M${MUG[0] + 2.4} ${MUG[1] - 2.4} Q${MUG[0] + 5} ${MUG[1] - 1.4} ${MUG[0] + 1.9} ${MUG[1] + 0.2}`
  );

  // ── Fincandan yükselen buhar ─────────────────────────────────
  const steam = pen(g, PEN * 0.4);

  return {
    g,
    costume: TEE as Costume,
    pose: 'sit',
    // Dinlenme pozu: el kupanın masadaki yerinde, baş düz
    work: {
      head: [45.4, 45.6],
      nearHand: MUG,
      farHand: FAR_REST,
    } satisfies WorkPose,
    // Yudum pozu: kupa ağızda, baş hafifçe geriye
    workAlt: {
      head: [45.2, 43],
      nearHand: [50.4, 48.4],
      farHand: FAR_REST,
    } satisfies WorkPose,
    prop: 'mug',
    setPropHeld(held) {
      tableMug.setAttribute('opacity', held ? '0' : '1');
    },
    width: 110,
    update(t) {
      // Buhar elde tutulan kupanın üstünde değil, masadaki tabağın
      // yanından yükseliyor — kupa figürle birlikte hareket ettiği için
      // buharı ona bağlamak sahneyi karıştırırdı.
      // Buhar masadaki tabaktan; kupa yer değiştirdiği için ona bağlı değil
      steam.setAttribute(
        'd',
        `M80.6 ${TABLE_TOP - 2.4} q${f(1.5 + Math.sin(t * 1.3) * 0.9)} -2.2 0 -4.4 ` +
          `q${f(-1.5 + Math.sin(t * 1.3 + 1.2) * 0.9)} -2.2 0 -4.4`
      );
      steam.setAttribute('opacity', f(0.34 + Math.sin(t * 0.8) * 0.14));
    },
  };
}
