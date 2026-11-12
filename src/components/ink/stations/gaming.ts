/*
  Durak 5 — pijamayla bilgisayar oyunu.

  Bandın ikinci masası, ama ikinci kod masası değil. İki durağı küçük
  ölçekte ayıran şey siluet: burada arkalığı yüksek bir oyuncu
  koltuğu, ayaklı tek bir geniş ekran ve ayrı bir klavye var; kod
  masasında sırtı alçak bir sandalye ve kapaklı bir dizüstü.

  Oturak yüksekliği yine 88 — bandın her durağında aynı, çünkü figürün
  tek bir oturma pozu var.

  Yerel uzay figürle ortak: zemin y=120, figür x=40'ta.
*/
import { el, f, pen, shape, PEN } from '@/lib/ink/ink';
import { PYJAMA, type Costume, type WorkPose } from '../figure';
import type { Station } from './microscope';

const DESK_TOP = 74;
const SEAT = 88;

export function gamingStation(parent: Element): Station {
  const g = el('g', {}, parent);

  // ── Oyuncu koltuğu ───────────────────────────────────────────
  /*
    Yüksek arkalık bu durağın imzası. İlk denemede tek dikdörtgen
    bloktu ve mezar taşı gibi duruyordu; sandalye diye okunmasını
    sağlayan şey üç ayrıntı: arkalığın hafifçe geriye yatması, tepesinde
    boşlukla ayrılmış bir boyunluk ve yandan çıkan kolçak.
  */
  shape(g, PEN * 0.9).setAttribute(
    'd',
    `M15.4 ${SEAT} L13.2 62.4 Q12.4 55.6 19.6 54.8 L30.8 55.4 Q36.2 56.6 35.4 63.4 L34 ${SEAT}Z`
  );
  pen(g, PEN * 0.5).setAttribute('d', 'M16.6 65.6 L34.8 66.6 M17 74 L34.4 74.8 M17.4 81.4 L34.1 82');
  // Boyunluk: arkalıktan iki kısa kolla ayrılmış
  pen(g, PEN * 0.6).setAttribute('d', 'M19.8 55 L19.4 51 M30.6 55.4 L30.4 51.4');
  shape(g, PEN * 0.8).setAttribute(
    'd',
    'M17.2 50.8 Q24 46.8 32.2 49.8 L31.4 44 Q23.6 41.2 16.8 45.2Z'
  );

  // Oturak ve kolçak
  shape(g, PEN * 0.9).setAttribute('d', `M14 ${SEAT} L46 ${SEAT} L46 ${SEAT + 3.4} L14 ${SEAT + 3.4}Z`);
  shape(g, PEN * 0.7).setAttribute('d', 'M34 75.6 L49.4 76.4 L49.2 78.8 L34 78Z');
  pen(g, PEN * 0.7).setAttribute('d', `M48 78.8 L47.4 ${SEAT}`);

  // Gaz pistonu ve yıldız ayak
  pen(g, PEN * 1.1).setAttribute('d', `M29 ${SEAT + 3.4} L29 108`);
  pen(g, PEN * 0.7).setAttribute('d', 'M29 108 L16 117 M29 108 L29.6 118 M29 108 L43 116');

  // ── Masa ─────────────────────────────────────────────────────
  shape(g, PEN).setAttribute(
    'd',
    `M50 ${DESK_TOP} L108 ${DESK_TOP} L108 ${DESK_TOP + 3.4} L50 ${DESK_TOP + 3.4}Z`
  );
  pen(g, PEN * 0.55).setAttribute('d', `M103 ${DESK_TOP + 3.4} L104 120 M53 ${DESK_TOP + 3.4} L52 120`);

  // ── Kasa: masanın altında, tek yeşil ışık ────────────────────
  shape(g, PEN * 0.7).setAttribute('d', 'M88 96 L100 96 L100 119 L88 119Z');
  /*
    LED gece sönmez, parlar: `--accent` saate göre kararıyor, bu değil.
    Çevresindeki hâle yalnızca geceye ait — sert bir daire olmaması için
    kenarına doğru saydamlaşıyor.
  */
  const ledGlow = el('radialGradient', { id: 'ink-pc-led' }, el('defs', {}, g));
  el('stop', { offset: 0, 'stop-color': 'rgb(62,214,135)', 'stop-opacity': 0.55 }, ledGlow);
  el('stop', { offset: 1, 'stop-color': 'rgb(62,214,135)', 'stop-opacity': 0 }, ledGlow);
  el('circle', { cx: 97.4, cy: 99.4, r: 5, fill: 'url(#ink-pc-led)', opacity: 'var(--lamp-on)' }, g);
  el('circle', { cx: 97.4, cy: 99.4, r: 1.1, fill: 'var(--led)' }, g);
  pen(g, PEN * 0.35).setAttribute('d', 'M90 102 L97 102 M90 105 L97 105');

  // ── Ekran: ayaklı, tek geniş panel ───────────────────────────
  /*
    Figür +x yönüne baktığı için ekranın yüzü -x'e dönük: panel
    menteşeden değil ayaktan yükseliyor ve üstü hafifçe geriye
    yatıyor. Dizüstünün eğik parelelkenarından farklı olması gereken
    şey tam olarak bu dikliği.
  */
  shape(g, PEN * 0.8).setAttribute('d', `M78 ${DESK_TOP - 1.6} L90 ${DESK_TOP - 1.6} L90 ${DESK_TOP} L78 ${DESK_TOP}Z`);
  pen(g, PEN * 0.9).setAttribute('d', `M84 ${DESK_TOP - 1.6} L84 66`);
  shape(g, PEN).setAttribute('d', 'M79.6 66.6 L89 67.6 L92 43.6 L82.6 43Z');
  const glow = el('path', {
    d: 'M81 65.4 L87.8 65.9 L90.6 45.2 L83.8 44.8Z',
    // Ekran geceleyin kararmaz, yanar: rengi banttan geliyor.
    fill: 'var(--screen)',
    stroke: 'none',
  }, g);

  // ── Klavye ve fare ───────────────────────────────────────────
  shape(g, PEN * 0.7).setAttribute(
    'd',
    `M52 ${DESK_TOP - 2} L68 ${DESK_TOP - 2} L69 ${DESK_TOP} L53 ${DESK_TOP}Z`
  );
  pen(g, PEN * 0.35).setAttribute(
    'd',
    `M54 ${DESK_TOP - 1.2} L67.4 ${DESK_TOP - 1.2} M54.4 ${DESK_TOP - 0.5} L67.8 ${DESK_TOP - 0.5}`
  );
  shape(g, PEN * 0.65).setAttribute(
    'd',
    `M71.4 ${DESK_TOP - 2.4} Q74.8 ${DESK_TOP - 3.4} 75.4 ${DESK_TOP - 1.2} L75 ${DESK_TOP} L71.4 ${DESK_TOP}Z`
  );

  // ── Kupa: her durakta tekrar eden nesne ──────────────────────
  el('path', {
    d: `M96 ${DESK_TOP - 6.4} L101.6 ${DESK_TOP - 6.4} L101 ${DESK_TOP} L96.6 ${DESK_TOP}Z`,
    fill: 'var(--accent)',
    stroke: 'currentColor',
    'stroke-width': PEN * 0.7,
    'stroke-linejoin': 'round',
  }, g);
  pen(g, PEN * 0.55).setAttribute(
    'd',
    `M101.6 ${DESK_TOP - 5.2} Q104.4 ${DESK_TOP - 4.4} 101.2 ${DESK_TOP - 2.6}`
  );

  return {
    g,
    costume: PYJAMA as Costume,
    pose: 'sit',
    label: 'Oyun oynarken',
    // Sol el klavyede, sağ el farede, baş ekrana dönük.
    work: {
      head: [49, 46.2],
      nearHand: [73, 71],
      farHand: [58.4, 71.4],
    } satisfies WorkPose,
    /*
      İkinci poz: oyun kızışınca öne eğilip fareyi öne itiyor. Çok
      küçük bir fark — bandın geri kalanı sakin olduğu için bu kadarı
      yetiyor.
    */
    workAlt: {
      head: [50.6, 45],
      nearHand: [75.2, 70.4],
      farHand: [59, 71],
    } satisfies WorkPose,
    width: 120,
    update(t) {
      /*
        Ekran ışığı kod masasınınkinden daha tedirgin: oyun sahnesi
        hızlı değişiyor. İki farklı hızda sinüs üst üste binince düzen
        gözle yakalanmıyor.
      */
      glow.setAttribute(
        'opacity',
        f(0.64 + Math.sin(t * 5.1) * 0.14 + Math.sin(t * 1.7 + 1.1) * 0.12)
      );
    },
  };
}
