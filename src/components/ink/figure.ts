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
  pt,
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
  /** Gövde dolgusu: verilmezse kâğıt. */
  colour?: string;
  /** Kol kalınlığı — paltolu kol biraz kalın. */
  sleeve?: number;
  /** Kapüşon: ensede duruyor ya da başa geçmiş. */
  hood?: 'down' | 'up';
  /** Önde kanguru cebi çizgisi. */
  pocket?: boolean;
  /** Yaka V'si çizilsin mi — kapüşonlularda yok. */
  collar?: boolean;
  /** Kapalı kask: başı tümüyle örtüyor, saç ve sakal gizleniyor. */
  helmet?: boolean;
  /**
   * Pantolon dolgusu. Verilmezse bacaklar kâğıt kalıyor; bir renk
   * verilince `limb()`'in kâğıt dolgusu o renge çevriliyor — üslubun
   * "düz renk pantolon" dediği şey bu.
   */
  trousers?: string;
}

/** Kot: tek düz renk, üslubun izin verdiği ikinci vurgu. */
export const DENIM = '#53657f';
/** Şeridin vurgu rengi; her durakta tekrar eden kupa bu renkte. */
export const ACCENT = '#2e8f63';

/*
  Kıyafetler. Hepsinin altında kot var; silueti ayıran şey üstteki tek
  ayrıntı: önlüğün boyu ve yakası, kapüşonun başta olması, cep.
*/
/** Mikroskop durağı: biyoloji geçmişini anlatan tek parça. */
export const LAB_COAT: Costume = { hem: 94, sleeve: 3.8, collar: true, trousers: DENIM };
export const TEE: Costume = { hem: 71, sleeve: 3.6, trousers: DENIM };
export const HOODIE: Costume = { hem: 74, sleeve: 4.2, hood: 'up', pocket: true, trousers: DENIM };
/** Motosiklet durağı: kısa mont ve kapalı kask. */
export const BIKER: Costume = { hem: 76, sleeve: 4, collar: true, helmet: true, trousers: DENIM };

/** Figürün oturduğunda ellerini ve başını götüreceği yerler. */
export interface WorkPose {
  nearHand: Vec;
  farHand: Vec;
  /** Başın merkezi — mikroskopta oküllerin hemen solu. */
  head: Vec;
}

export interface FigureState {
  /** O anki kıyafet. Duraklar arasında değişiyor; iskelet değişmiyor. */
  costume: Costume;
  /** 0 durdu, 1 tam yürüyor. Aradaki değerler adımı yerinde söndürüyor. */
  go: number;
  /** 0 ayakta, 1 oturmuş. */
  sit: number;
  /**
   * Ellerin ve başın işe ne kadar yöneldiği (0–1). Oturan duraklarda
   * `sit` ile birlikte gidiyor; ayakta çalışılan duraklarda gövde dik
   * kalırken yalnızca bu değer yükseliyor.
   */
  reach?: number;
  /** Oturunca ellerin ve başın gideceği yerler. */
  work?: WorkPose;
  /**
   * Yakın elde tutulan nesne. Durağın içine sabit koyulduğunda el ona
   * yumuşayarak gittiği için nesne havada asılı kalıyordu; figüre bağlı
   * olunca elle birlikte gidiyor.
   */
  prop?: 'mug';
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

  /*
    Dirseğin omuz–el doğrusundan sapması sınırlanıyor. El ağza gelecek
    kadar yakınsa (kahve içmek) kol tamamen katlanıyor ve gerçek IK
    dirseği çok dışarı atıyor; `limb()` orta noktayı kuadratik kontrol
    noktası alıp sapmayı 1.55 katına çıkardığı için sonuç kolun kendi
    üstüne kıvrıldığı bir ilmek oluyordu.
  */
  const ux = dx / d;
  const uy = dy / d;
  const along = (e[0] - a[0]) * ux + (e[1] - a[1]) * uy;
  let offX = e[0] - a[0] - along * ux;
  let offY = e[1] - a[1] - along * uy;
  const off = Math.hypot(offX, offY);
  const MAX_OFF = 8;
  if (off > MAX_OFF) {
    offX *= MAX_OFF / off;
    offY *= MAX_OFF / off;
  }
  const capped: Vec = [a[0] + along * ux + offX, a[1] + along * uy + offY];
  return mix([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], capped, 0.55);
}

/*
  Oturuş hedefleri. Tabure yüksekliği duraklarla ortak (SEAT = 88).

  Kalça bilerek tezgâha yakın ve eğim küçük. Geride oturup 25° eğilince
  omuz çok öne gidiyor, sırt da zorunlu olarak uzun bir diyagonal oluyor
  ve palto aşağı doğru yelpaze gibi açılıyordu. Yakın oturup az eğilmek
  hem gerçekçi hem de siluet dar kalıyor.
*/
const SIT_HIP: Vec = [38, 85];
const SIT_KNEE_NEAR: Vec = [58, 88];
const SIT_KNEE_FAR: Vec = [54.5, 89];
const SIT_ANKLE_NEAR: Vec = [59, 116];
const SIT_ANKLE_FAR: Vec = [49, 116];
const SIT_LEAN = (17 * Math.PI) / 180;

export function createFigure(parent: Element): Figure {
  const g = el('g', {}, parent);

  /*
    Görünmez çerçeve. Mürekkep filtresinin bölgesi grubun sınırlayıcı
    kutusuna oranlı; uzuvlar salındıkça kutu değişirse filtre her karede
    yeniden örnekleniyor ve bazı tarayıcılarda boyama izleri kalıyor.
    Geometrisi olan ama çizilmeyen bir dikdörtgen kutuyu sabitliyor.
  */
  el('rect', { x: 8, y: 18, width: 76, height: 108, fill: 'none', stroke: 'none' }, g);

  /*
    Kol kalınlığı kostümle değişiyor ama `limb()` genişliği kuruluşta
    alıyor. En kalın değerle kurulup ince kostümlerde biraz dar görünmesi
    yerine, iki uzuv da orta bir değerde: fark gözle seçilmiyor, buna
    karşılık kostüm değiştiğinde parçaları yeniden yaratmak gerekmiyor.
  */
  const farArm: Limb = limb(g, 4);
  const farLeg: Limb = limb(g, 4.2);
  const farShoe = blot(g);
  const nearLeg: Limb = limb(g, 4.2);
  const nearShoe = blot(g);
  // `limb()` kâğıt dolgusunu ilk alt yola koyuyor; pantolon için onu
  // kare başına boyuyoruz (`solid()` tek seferlik, kostüm değişemiyor).
  const legFills = [farLeg, nearLeg].map((l) => l.g.querySelector('path'));
  const hoodDown = blot(g); // ensede, giysinin arkasında
  const garment = shape(g);
  const seam = pen(g, PEN * 0.55);
  const pocket = pen(g, PEN * 0.5);
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
  const hoodUp = shape(g, PEN); // başa geçmiş kapüşon, saçın önünde
  const helmet = shape(g, PEN); // kask kabuğu — saçın ve sakalın önünde
  const visor = blot(g);
  const chinBar = pen(g, PEN * 0.5);
  const nearArm: Limb = limb(g, 4);
  // Elde taşınan nesne kolun önünde
  const propBody = el('path', {
    fill: ACCENT,
    stroke: 'currentColor',
    'stroke-width': PEN * 0.7,
    'stroke-linejoin': 'round',
  }, g);
  const propHandle = pen(g, PEN * 0.55);

  const walk: Gait = gait({ kind: 'walk' });
  const armSwing: [Spring, Spring] = [spring(60, 9), spring(60, 9)];
  let phase = 0;

  return {
    g,
    update(dt, state) {
      const costume = state.costume;
      const go = clamp(state.go, 0, 1);
      const sit = clamp(state.sit, 0, 1);
      const reach = clamp(state.reach ?? sit, 0, 1);
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

      /*
        Baş iş pozuna `reach` ile gidiyor, `sit` ile değil: ayakta
        telefonuna bakan biri de başını eğiyor ama oturmuyor.
      */
      const standHead: Vec = [42.6, 31.6 + b];
      const restHead: Vec = mix(
        standHead,
        [sitSh[0] + 5.2 * Math.sin(SIT_LEAN) + 1.4, sitSh[1] - 10.2 * Math.cos(SIT_LEAN)],
        sit
      );
      const hc = state.work ? mix(restHead, state.work.head, reach) : restHead;

      // ── Pantolon: bacak dolgularının rengi ───────────────────
      for (const fill of legFills) {
        if (!fill) continue;
        if (costume.trousers) {
          fill.classList.remove('pp');
          fill.setAttribute('fill', costume.trousers);
        } else {
          fill.classList.add('pp');
          fill.setAttribute('fill', PAPER);
        }
      }

      // ── Bacaklar; öndeki bacak üstte ─────────────────────────
      farLeg.draw([hip, kneeF, ankleF], [0.3, 0.8]);
      shoe(farShoe, ankleF, lerp(p.feet[back].pitch, -3, sit));
      nearLeg.draw([hip, kneeN, ankleN], [0.3, 0.8]);
      shoe(nearShoe, ankleN, lerp(p.feet[p.front].pitch, -3, sit));

      // ── Giysi ────────────────────────────────────────────────
      /*
        Siluet altı noktadan kuruluyor ve iki poz da aynı yapıyı
        kullanıyor: omuzlar, kalça hizasında ön ve arka, sonra etek.

        Kritik olan kalça hizasındaki iki nokta. Onlar olmadan ön kenar
        omuzdan doğrudan dize iniyor, gövde ile kucak tek bir kamada
        birleşiyor ve oturan figür çuval gibi duruyordu. Kalçada daralıp
        oradan öne açılınca gövde dar bir sütun, kucak da yatay bir bant
        olarak okunuyor.

        Eksen `lean` ile dönüyor: ayakta 0, otururken 17°. Böylece tek
        bir yapı iki pozu da veriyor ve aradaki kareler tutarlı kalıyor.
      */
      const lean = SIT_LEAN * sit;
      const px = Math.cos(lean);
      const py = Math.sin(lean);
      const side = (base: Vec, w: number): Vec => [base[0] + px * w, base[1] + py * w];

      /*
        Oturuşta etek dar bir aralığa çekiliyor: 88'den aşağısı tabureyi
        ve baldırları örtüyor, 84'ten yukarısı ise kısa bir kapüşonluda
        kalçanın üstünde kalıp bacakla arasında boşluk bırakıyor.
      */
      const hem = lerp(costume.hem, clamp(costume.hem, 84, 88), sit);

      /*
        Giysinin beli her zaman eteğinin üstünde kalmalı. Kısa bir
        kapüşonluda etek kalçanın üstüne çıkıyor; bel yine kalçada
        bırakılırsa siluet kendi üstüne katlanıp sivri bir kama
        oluşturuyor. Bel, gövde ekseni üzerinde eteğin biraz üstüne
        kaydırılıyor.
      */
      const waistY = Math.min(hip[1], hem - 5);
      const axisSpan = hip[1] - sh[1] || 1;
      const waist: Vec = [
        lerp(hip[0], sh[0], (hip[1] - waistY) / axisSpan),
        waistY,
      ];

      const shBack = side(sh, -5);
      const shFront = side(sh, 4.6);
      const hipFront = side(waist, 5.5);
      const hipBack = side(waist, -6);
      /*
        Etek yalnızca giysi gerçekten dize kadar iniyorsa öndeki dizi
        takip ediyor — uzun paltonun adımla açılıp kapanması bundan.
        Kısa bir kapüşonluda etek dizin epey üstünde bitiyor; dizi yine
        takip ederse kumaş boşlukta öne doğru uzanıp kasıkta bir çıkıntı
        yapıyor. Takip oranı eteğin dize ne kadar yaklaştığıyla ölçülüyor.
      */
      const kneeFollow = clamp((hem - 84) / 8, 0, 1);
      const frontX = lerp(hipFront[0] + 1.4, Math.max(kneeN[0] + 1.6, 44.6), kneeFollow);
      const hemFront: Vec = [frontX, hem];
      const hemBack: Vec = [lerp(34.2, hip[0] - 4, sit), hem + 1];

      garment.setAttribute(
        'd',
        `M${pt(shBack)} Q${f(sh[0] - py * 3)} ${f(sh[1] - 3)} ${pt(shFront)} ` +
          `L${pt(hipFront)} ` +
          `Q${f(lerp(frontX, hipFront[0] + 6, sit))} ${f(lerp(hem - 9, hipFront[1] + 0.4, sit))} ${pt(hemFront)} ` +
          `L${pt(hemBack)} L${pt(hipBack)}Z`
      );
      seam.setAttribute(
        'd',
        costume.collar
          ? `M${f(sh[0] - 2.6 * px)} ${f(sh[1] + 0.4)} L${f(sh[0] + 0.4)} ${f(sh[1] + 5)} ` +
              `L${f(sh[0] + 3.2 * px)} ${f(sh[1] - 0.4)} ` +
              `M${f(sh[0] + 0.6)} ${f(sh[1] + 6)} L${f(hipFront[0] - 3)} ${f(hipFront[1] - 3)}`
          : `M${f(sh[0] - 2.2)} ${f(sh[1] + 1.6)} Q${f(sh[0] + 0.2)} ${f(sh[1] + 4.6)} ${f(sh[0] + 2.6)} ${f(sh[1] + 1.4)}`
      );
      // Kapüşon ensede: omuzların arkasına düşen bir leke
      hoodDown.setAttribute(
        'd',
        costume.hood === 'down'
          ? `M${f(sh[0] - 4.6)} ${f(sh[1] - 0.6)} Q${f(sh[0] - 7.4)} ${f(sh[1] + 7)} ${f(sh[0] - 2.2)} ${f(sh[1] + 9.4)} ` +
              `Q${f(sh[0] + 1.4)} ${f(sh[1] + 6)} ${f(sh[0] + 1.6)} ${f(sh[1] - 0.4)}Z`
          : ''
      );
      // Kanguru cebi
      pocket.setAttribute(
        'd',
        costume.pocket
          ? `M${f(hipFront[0] - 8.6)} ${f(hem - 11)} L${f(hipFront[0] - 2.2)} ${f(hem - 10.2)} ` +
              `M${f(hipFront[0] - 9)} ${f(hem - 5.4)} L${f(hipFront[0] - 1.8)} ${f(hem - 4.6)}`
          : ''
      );

      // ── Baş, saç, sakal ──────────────────────────────────────
      head.setAttribute('cx', f(hc[0]));
      head.setAttribute('cy', f(hc[1]));
      neck.setAttribute(
        'd',
        `M${f(hc[0] - 2.2)} ${f(hc[1] + 4.2)} L${f(sh[0] - 1.4)} ${f(sh[1] - 0.6)} ` +
          `M${f(hc[0] + 1.6)} ${f(hc[1] + 4.4)} L${f(sh[0] + 2.4)} ${f(sh[1] - 0.4)}`
      );
      /*
        Kapüşon başa geçtiğinde saç gizleniyor: ikisi birden çizilince
        kapüşonun altından leke taşıyor. Kapüşon başın arkasını ve üstünü
        sarıyor, yüz tarafı (+x) açık kalıyor.
      */
      const up = costume.hood === 'up';
      const lid = costume.helmet === true;
      hoodUp.setAttribute(
        'd',
        up && !lid
          ? `M${f(hc[0] + 3.4)} ${f(hc[1] - 4.2)} Q${f(hc[0] - 1.4)} ${f(hc[1] - 8.4)} ${f(hc[0] - 5.6)} ${f(hc[1] - 3.4)} ` +
              `Q${f(hc[0] - 8)} ${f(hc[1] + 2.6)} ${f(hc[0] - 4.6)} ${f(hc[1] + 6.8)} ` +
              `L${f(hc[0] - 1.6)} ${f(hc[1] + 6)} Q${f(hc[0] - 4.4)} ${f(hc[1] + 1.6)} ${f(hc[0] - 2.6)} ${f(hc[1] - 2.6)} ` +
              `Q${f(hc[0] + 0.6)} ${f(hc[1] - 6)} ${f(hc[0] + 3.4)} ${f(hc[1] - 4.2)}Z`
          : ''
      );
      hair.setAttribute(
        'd',
        up || lid
          ? ''
          : `M${f(hc[0] - 4.1)} ${f(hc[1] - 1.3)} Q${f(hc[0] - 4.5)} ${f(hc[1] - 6.3)} ${f(hc[0] + 0.5)} ${f(hc[1] - 5.2)} ` +
          `Q${f(hc[0] + 3.7)} ${f(hc[1] - 4.4)} ${f(hc[0] + 3.5)} ${f(hc[1] - 2.5)} ` +
          `Q${f(hc[0] + 1.3)} ${f(hc[1] - 3.9)} ${f(hc[0] - 1.7)} ${f(hc[1] - 3.2)} ` +
            `Q${f(hc[0] - 3.4)} ${f(hc[1] - 2.8)} ${f(hc[0] - 4.1)} ${f(hc[1] - 1.3)}Z`
      );
      // Sakal: çene hattında ince bir leke. Büyük çizilince yüzü kaplayıp
      // maske gibi duruyordu.
      beard.setAttribute(
        'd',
        lid
          ? ''
          : `M${f(hc[0] + 1.4)} ${f(hc[1] + 1.4)} Q${f(hc[0] + 3.2)} ${f(hc[1] + 2)} ${f(hc[0] + 2.2)} ${f(hc[1] + 3.6)} ` +
            `Q${f(hc[0] + 0.8)} ${f(hc[1] + 4.6)} ${f(hc[0] - 0.8)} ${f(hc[1] + 3.8)} ` +
            `Q${f(hc[0] + 0.4)} ${f(hc[1] + 2.8)} ${f(hc[0] + 1.4)} ${f(hc[1] + 1.4)}Z`
      );

      /*
        Kask. Kapalı bir kabuk: başı tümüyle örtüyor, siperlik koyu bir
        leke. Saç ve sakal gizleniyor — yüz görünmüyor ama siluet
        tanıdık kalıyor, bandın anlattığı şey zaten aynı kişinin beş
        hâli.
      */
      helmet.setAttribute(
        'd',
        lid
          ? `M${f(hc[0] + 5.4)} ${f(hc[1] - 2.8)} Q${f(hc[0] + 5.6)} ${f(hc[1] - 7.8)} ${f(hc[0] - 0.4)} ${f(hc[1] - 8)} ` +
              `Q${f(hc[0] - 6.6)} ${f(hc[1] - 7.8)} ${f(hc[0] - 6.4)} ${f(hc[1] - 0.6)} ` +
              `Q${f(hc[0] - 6.2)} ${f(hc[1] + 3.8)} ${f(hc[0] - 3.4)} ${f(hc[1] + 5.4)} ` +
              `L${f(hc[0] + 0.8)} ${f(hc[1] + 5.8)} ` +
              `Q${f(hc[0] + 6)} ${f(hc[1] + 5.2)} ${f(hc[0] + 6.4)} ${f(hc[1] + 1.4)} ` +
              `Q${f(hc[0] + 6.6)} ${f(hc[1] - 0.8)} ${f(hc[0] + 5.4)} ${f(hc[1] - 2.8)}Z`
          : ''
      );
      // Siperlik: öne bakan geniş koyu bant. Kaskı kafadan ayıran şey bu.
      visor.setAttribute(
        'd',
        lid
          ? `M${f(hc[0] - 0.2)} ${f(hc[1] - 5.6)} Q${f(hc[0] + 5)} ${f(hc[1] - 5.4)} ${f(hc[0] + 5.2)} ${f(hc[1] - 1.8)} ` +
              `Q${f(hc[0] + 5)} ${f(hc[1] + 0.8)} ${f(hc[0] - 0.2)} ${f(hc[1] + 0.4)}Z`
          : ''
      );
      // Çene barının alt kenarı
      chinBar.setAttribute(
        'd',
        lid
          ? `M${f(hc[0] + 0.8)} ${f(hc[1] + 2.2)} Q${f(hc[0] + 4.4)} ${f(hc[1] + 2)} ${f(hc[0] + 6.2)} ${f(hc[1] + 0.6)}`
          : ''
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

      if (state.work && reach > 0.001) {
        const nearHand = mix(nearHandStand, state.work.nearHand, reach);
        const farHand = mix(farHandStand, state.work.farHand, reach);
        farArm.draw([shF, elbow(shF, farHand), farHand], [0.2, 0.5]);
        nearArm.draw([shN, elbow(shN, nearHand), nearHand], [0.2, 0.45]);
      } else {
        farArm.draw([shF, farElbStand, farHandStand], [0.2, 0.5]);
        nearArm.draw([shN, nearElbStand, nearHandStand], [0.2, 0.45]);
      }

      // ── Elde taşınan kupa ────────────────────────────────────
      if (state.prop === 'mug' && reach > 0.001) {
        const h = state.work
          ? mix(nearHandStand, state.work.nearHand, reach)
          : nearHandStand;
        propBody.setAttribute(
          'd',
          `M${f(h[0] - 2.6)} ${f(h[1] - 3.4)} L${f(h[0] + 2.4)} ${f(h[1] - 3.4)} ` +
            `L${f(h[0] + 1.9)} ${f(h[1] + 1.4)} L${f(h[0] - 2.1)} ${f(h[1] + 1.4)}Z`
        );
        propHandle.setAttribute(
          'd',
          `M${f(h[0] + 2.4)} ${f(h[1] - 2.4)} Q${f(h[0] + 5)} ${f(h[1] - 1.4)} ${f(h[0] + 1.9)} ${f(h[1] + 0.2)}`
        );
        propBody.setAttribute('opacity', f(reach));
        propHandle.setAttribute('opacity', f(reach));
      } else {
        propBody.setAttribute('d', '');
        propHandle.setAttribute('d', '');
      }

      return walk.speed * dt * go;
    },
  };
}
