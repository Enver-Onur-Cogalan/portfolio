/**
 * Hero videosunun dosyaları ve geçişin hedefi.
 *
 * Dosyalar scripts/encode-hero-video.sh ile üretiliyor.
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
  /** Bu dosyanın kaynak videonun hangi bölgesini gösterdiği */
  region: FrameRegion;
}

/**
 * Dikey sürümü kullanan ekranlar. Telefonlar ve dikey tabletler; yatay
 * videonun ortasındaki şerit bunlarda daha net görünüyor.
 */
export const PORTRAIT_QUERY = '(orientation: portrait) and (max-width: 1023px)';

export const heroVideo: {
  landscape: HeroVideoSource;
  portrait: HeroVideoSource;
  /**
   * Geçişte kameranın daldığı nokta: son karedeki büyük hücrenin merkezi,
   * kaynak videonun (1920×1080) pikselinde. Video değişirse güncellenmeli.
   */
  diveTarget: { x: number; y: number };
} = {
  landscape: {
    video: '/video/hero-landscape.mp4',
    first: '/video/hero-landscape-first.webp',
    region: { x: 0, y: 0, width: 1920, height: 1080 },
  },
  portrait: {
    video: '/video/hero-portrait.mp4',
    first: '/video/hero-portrait-first.webp',
    // Yataydan ortadaki 608 px'lik şerit (bkz. encode betiği)
    region: { x: 656, y: 0, width: 608, height: 1080 },
  },
  diveTarget: { x: 909, y: 588 },
};
