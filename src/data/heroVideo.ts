/**
 * Hero videosu ve Hakkımda'ya geçiş için ortak bilgiler.
 *
 * Dosyalar scripts/encode-hero-video.sh ile üretiliyor. Hero hangi videoyu
 * oynatacağını, Hakkımda'yı açan maske de hangi son kareyi göstereceğini
 * buradan okuyor; ikisinin aynı ekranda aynı dosyayı seçmesi gerekiyor,
 * yoksa videonun son karesinden maskeye geçerken görüntü sıçrar.
 */

/** Kaynak videodaki bir bölge (piksel). Kesim sonrası kalan kısmı anlatır. */
export interface FrameRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HeroVideoSource {
  video: string;
  /** İlk kare: video yüklenene kadar poster */
  first: string;
  /** Son kare: geçiş maskesinin zemini */
  last: string;
  /** Bu dosyanın kaynak videonun hangi bölgesini gösterdiği */
  region: FrameRegion;
}

/**
 * Dikey sürümü kullanan ekranlar. Telefonlar ve dikey tabletler; yatay
 * videonun ortasındaki şerit bunlarda daha net görünüyor.
 */
export const PORTRAIT_QUERY = '(orientation: portrait) and (max-width: 1023px)';

export const heroVideo: { landscape: HeroVideoSource; portrait: HeroVideoSource } = {
  landscape: {
    video: '/video/hero-landscape.mp4',
    first: '/video/hero-landscape-first.webp',
    last: '/video/hero-landscape-last.webp',
    region: { x: 0, y: 0, width: 1920, height: 1080 },
  },
  portrait: {
    video: '/video/hero-portrait.mp4',
    first: '/video/hero-portrait-first.webp',
    last: '/video/hero-portrait-last.webp',
    // Yataydan ortadaki 608 px'lik şerit (bkz. encode betiği)
    region: { x: 656, y: 0, width: 608, height: 1080 },
  },
};

export interface Cell {
  /** Merkez ve yarıçap, kaynak videonun (1920×1080) son karesinde */
  x: number;
  y: number;
  r: number;
  /** Açılma gecikmesi, geçişin 0–1 aralığında */
  delay: number;
}

/**
 * Son karedeki hücreler (4,4. saniye; video orada kesiliyor). Hakkımda
 * tam bu hücrelerin yerinden açılıyor: önce her hücre kendi boyutunda bir
 * pencereye dönüşüyor, sonra pencereler büyüyüp birleşerek ekranı
 * kaplıyor. En büyük hücre ilk açılıyor, kenardakiler en son.
 */
export const heroCells: Cell[] = [
  { x: 909, y: 588, r: 405, delay: 0 },
  { x: 216, y: 813, r: 186, delay: 0.08 },
  { x: 1713, y: 490, r: 175, delay: 0.12 },
  { x: 386, y: 462, r: 158, delay: 0.18 },
  { x: 1150, y: 123, r: 150, delay: 0.22 },
  { x: 1485, y: 1085, r: 135, delay: 0.25 },
];
