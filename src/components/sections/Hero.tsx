'use client';

import { useEffect, useRef } from 'react';
import { Download, ArrowRight } from 'lucide-react';
import HeroPhone from '@/components/ui/HeroPhone';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { scrollToSection } from '@/lib/scroll';
import { useLanguage } from '@/context/LanguageContext';
import { socialLinks } from '@/data/portfolio';
import { CV_PATH, CV_DOWNLOAD_NAME } from '@/data/site';
import { heroVideo, PORTRAIT_QUERY, type HeroVideoSource } from '@/data/heroVideo';

/**
 * Hakkımda'ya geçiş iki parça:
 *
 * - Dalış: pin'in bu noktasından sonra kamera büyük hücrenin içine dalıyor.
 * - Erime: görüntü sitenin arka plan rengine eriyor. Pin bitmeden biraz
 *   önce başlıyor, hero ekrandan çıkarken bitiyor. Erime pin içinde
 *   tamamlandığında hero'nun son ekranı düz renk kalıyor ve Hakkımda
 *   gelene kadar bir ekran boyu boşluk geçiyordu; şimdi hücre yukarı kayıp
 *   erirken Hakkımda hemen altından yükseliyor.
 *
 * İkisi de yalnızca kaydırma konumuna bağlı; açılıp kapanan bir durum yok.
 */
const DIVE_START = 0.78;
/** Erime, pin'in son %10'unda başlıyor */
const MELT_BEFORE_END = 0.1;
/** ve hero ekran yüksekliğinin %55'i kadar yukarı çıktığında bitiyor */
const MELT_AFTER_END = 0.55;
/** Dalışın sonunda video kaç kat büyümüş olacak */
const DIVE_SCALE = 2.4;

/** Kaynak karedeki bir noktanın, object-cover ile yerleşmiş ekrandaki yeri */
function placeOnScreen(source: HeroVideoSource, point: { x: number; y: number }, width: number, height: number) {
  const { region } = source;
  const scale = Math.max(width / region.width, height / region.height);
  return {
    x: (point.x - region.x) * scale + (width - region.width * scale) / 2,
    y: (point.y - region.y) * scale + (height - region.height * scale) / 2,
  };
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const welcome = welcomeRef.current;
    const shade = shadeRef.current;
    const media = mediaRef.current;
    const fade = fadeRef.current;
    const edge = edgeRef.current;
    if (!container || !video || !welcome || !shade || !media || !fade || !edge) return;

    // Hareket azaltma tercihi: kaydırmaya bağlı video, sabitleme, dalış ve
    // erime yok. Hero ilk karenin posteriyle durağan bir ekran olarak
    // kalıyor, video hiç indirilmiyor; sayfa normal akıyor.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mobile = window.innerWidth < 768;

    // Ekrana uygun sürüm: dikey ekranlara ortadan kesilmiş dikey video
    const source = window.matchMedia(PORTRAIT_QUERY).matches
      ? heroVideo.portrait
      : heroVideo.landscape;
    if (!video.src.endsWith(source.video)) {
      video.src = source.video;
      video.load();
    }
    video.pause();
    video.currentTime = 0;

    // Video ilk karesini çizene kadar görünmez; altında aynı karenin
    // posteri duruyor. Böylece yavaş bağlantıda siyah ekran görünmüyor.
    const reveal = () => {
      video.style.opacity = '1';
    };
    video.addEventListener('loadeddata', reveal);
    video.addEventListener('seeked', reveal);
    if (video.readyState >= 2) reveal();

    // Video kare kare, kaydırdıkça iniyordu; yavaş bağlantıda takılıyordu.
    // Sayfa yüklendikten sonra tamamını arka planda indir.
    const preloadAll = () => {
      video.preload = 'auto';
    };
    if (document.readyState === 'complete') preloadAll();
    else window.addEventListener('load', preloadAll, { once: true });

    // Dalışın merkezi: büyük hücrenin ekrandaki yeri. Ekran boyutu
    // değişince yeniden hesaplanıyor.
    const aimAtCell = () => {
      const point = placeOnScreen(source, heroVideo.diveTarget, container.clientWidth, container.clientHeight);
      media.style.transformOrigin = `${point.x}px ${point.y}px`;
    };
    aimAtCell();
    window.addEventListener('resize', aimAtCell);

    const easeIn = gsap.parseEase('power2.in');
    const easeInOut = gsap.parseEase('power1.inOut');

    // Geçişin bütün görüntüsü yalnızca ilerlemeden hesaplanıyor: aynı
    // kaydırma konumunda, hangi yönden gelinirse gelinsin ve araya ne
    // kadar takılma girerse girsin, ekranda hep aynı şey var. Açılıp
    // kapanan bir durum (göster/gizle) yok; bozulabilecek bir şey de yok.
    const drawDive = (progress: number) => {
      const dive = gsap.utils.clamp(0, 1, (progress - DIVE_START) / (1 - DIVE_START));
      media.style.transform = dive > 0 ? `scale(${1 + (DIVE_SCALE - 1) * easeIn(dive)})` : '';
    };
    const drawMelt = (progress: number) => {
      fade.style.opacity = String(easeInOut(progress));
      // Hero ekrandan çıkarken alt kenarı Hakkımda'nın zeminine sert bir
      // çizgiyle değiyordu; kenar erimenin başında yumuşuyor.
      edge.style.opacity = String(gsap.utils.clamp(0, 1, progress * 4));
    };

    let rafId = 0;
    let lastSeek = 0;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        // Video 4,4 sn; mesafe eski 5 sn'lik videonun hızını koruyor
        end: mobile ? '+=1320' : '+=2640',
        pin: true,
        // Sayfadaki ilk pin; sonraki pin'lerden önce ölçülmeli
        refreshPriority: 2,
        scrub: mobile ? 2 : 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            // Mobilde çok küçük değişimlerde kare aranmıyor (çözme maliyeti);
            // görsel geçiş ise her güncellemede çiziliyor, uçta takılı kalmasın.
            const seekStep = mobile ? 0.008 : 0;
            if (video.duration && (Math.abs(progress - lastSeek) >= seekStep || progress === 0 || progress === 1)) {
              video.currentTime = progress * video.duration;
              lastSeek = progress;
            }
            const opacity = Math.max(0, 1 - progress * 3);
            welcome.style.opacity = String(opacity);
            shade.style.opacity = String(opacity);
            // Solmuş düğmeler görünmez olsa da tıklanabiliyordu
            welcome.style.pointerEvents = opacity < 0.2 ? 'none' : '';
            drawDive(progress);
          });
        },
      });

      // Erime ayrı bir tetikleyicide: aralığı pin'in sonunu aşıyor. Yumuşatma
      // yok, doğrudan kaydırma konumunu izliyor.
      const melt = ScrollTrigger.create({
        trigger: container,
        start: () => trigger.end - (trigger.end - trigger.start) * MELT_BEFORE_END,
        end: () => trigger.end + window.innerHeight * MELT_AFTER_END,
        // Pin'den sonra ölçülmeli: aralığı pin'in bittiği yere göre
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => drawMelt(self.progress),
        onRefresh: (self) => drawMelt(self.progress),
      });

      // Sayfa aşağıda bir konumda açılırsa (yenileme, geri tuşu) geçiş o
      // konuma göre çizilmiş başlasın
      drawDive(trigger.progress);
      drawMelt(melt.progress);
    }, container);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('loadeddata', reveal);
      video.removeEventListener('seeked', reveal);
      window.removeEventListener('load', preloadAll);
      window.removeEventListener('resize', aimAtCell);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: '#000' }}
    >
      {/* Poster ve video tek katmanda: dalışta birlikte büyüyorlar */}
      <div ref={mediaRef} className="absolute inset-0 will-change-transform">
        {/* Poster: ekrana uygun ilk kare, HTML'de olduğu için JavaScript
            beklenmeden yükleniyor. Öncelik verilmiyor: telefondaki fotoğrafla
            (sayfanın LCP öğesi) bant genişliği için yarışıyordu. */}
        <picture>
          <source media={PORTRAIT_QUERY} srcSet={heroVideo.portrait.first} />
          <img
            src={heroVideo.landscape.first}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      </div>

      {/* Yazıyı okunur tutan örtüler; yazıyla birlikte soluyorlar */}
      <div ref={shadeRef} className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-black/30" />
        {/* Masaüstünde soldan, mobilde alttan biraz daha koyu: metnin
            durduğu taraf. Mikroskobun durduğu orta kısım açık kalıyor. */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 34%, rgba(0,0,0,0) 52%)' }}
        />
        <div
          className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 65%)' }}
        />
      </div>

      {/* Alt kenarı arka plan rengine karıştıran geçiş (erimeyle görünür) */}
      <div
        ref={edgeRef}
        className="absolute inset-x-0 bottom-0 h-2/5 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--background))', opacity: 0 }}
        aria-hidden="true"
      />

      {/* Geçişin sonu: görüntü sitenin arka plan rengine eriyor. En üstte
          duruyor ki kaydırma ipucu da onunla birlikte kaybolsun. */}
      <div
        ref={fadeRef}
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ background: 'var(--background)', opacity: 0 }}
        aria-hidden="true"
      />

      {/*
        Videonun ilk karesinde mikroskop yatayda kabaca %37–63 arasında,
        yani tam ortada; kaydırınca kamera ona yaklaşıyor. Masaüstünde metin
        soldaki düz duvara, telefon sağdaki masa ucuna yerleşiyor ki sahnenin
        öznesi ortada açık kalsın. Konumlar bu yüzden kapsayıcıya değil
        ekran genişliğine (vw) göre veriliyor: geniş ekranda ortalanmış bir
        kapsayıcı metni yine mikroskobun üstüne itiyordu. lg'den küçük
        ekranlarda yan yana yer olmadığı için alt alta geçer.

        Mobilde yükseklik svh: iOS Safari'de 100vh adres çubuğu gizliyken
        ölçülüyor, içerik görünen alanın altına kayıp düğmeler aşağıda
        kalıyordu.

        Telefon "kim" sorusunu cevaplıyor (fotoğraf, isim, unvan); yanındaki
        metin "ne yapıyor, neden ilgilenmeliyim, nasıl ulaşırım" sorularını.
      */}
      <div
        ref={welcomeRef}
        className="absolute inset-x-0 top-0 h-svh lg:h-full z-10 px-5 md:px-12 lg:px-[6vw] pt-12 md:pt-16 pb-14 lg:py-0"
      >
        <div className="h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-5 lg:gap-10">
          <div className="hero-rise shrink-0 lg:order-2 lg:mr-[2vw]">
            <div className="hero-phone-size">
              <HeroPhone />
            </div>
          </div>

          <div className="hero-rise hero-rise-delay text-center lg:text-left max-w-xl lg:max-w-[min(38vw,36rem)]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 backdrop-blur-sm px-3 py-1 text-xs md:text-sm text-white/85">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#2EE07C] opacity-70 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2EE07C]" />
              </span>
              <span>
                <span className="font-semibold text-white">{t('hero.status')}</span>
                <span className="mx-1.5 text-white/40">·</span>
                {t('hero.location')}
              </span>
            </p>

            <h2 className="mt-3 lg:mt-5 text-[1.7rem] leading-[1.1] sm:text-4xl lg:text-[clamp(2.25rem,3.4vw,3.75rem)] font-bold text-white font-heading text-balance">
              {t('hero.title')}
            </h2>

            <p className="mt-2.5 lg:mt-5 text-sm md:text-base xl:text-lg text-white/80 leading-relaxed text-balance whitespace-pre-line">
              {t('hero.lead')}
            </p>

            <div className="mt-4 lg:mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 md:gap-3">
              <a
                href={CV_PATH}
                download={CV_DOWNLOAD_NAME}
                className="inline-flex items-center gap-2 rounded-full bg-[#2EE07C] px-5 py-2.5 md:py-3 text-sm md:text-base font-semibold text-[#05140b] shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-white"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                {t('hero.cv')}
              </a>
              <button
                type="button"
                onClick={() => scrollToSection('iletisim')}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-5 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-white"
              >
                {t('hero.contact')}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <span className="hidden sm:flex items-center gap-1 lg:ml-1">
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2.5 rounded-full text-white/75 transition-colors hover:text-white hover:bg-white/10 focus-visible:outline-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2.5 rounded-full text-white/75 transition-colors hover:text-white hover:bg-white/10 focus-visible:outline-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute top-[calc(100svh-4rem)] lg:top-auto lg:bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/70 pointer-events-none"
        aria-hidden="true"
      >
        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em]">{t('hero.scroll')}</span>
        <svg
          className="w-5 h-5 md:w-6 md:h-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}
