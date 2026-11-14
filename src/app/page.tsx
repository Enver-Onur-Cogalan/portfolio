import Hero from '@/components/sections/Hero';
import ScrollMask from '@/components/ui/ScrollMask';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Experience from '@/components/sections/Experience';
import Contact from '@/components/sections/Contact';
import { heroCells, heroVideo, PORTRAIT_QUERY } from '@/data/heroVideo';

// Örtünün zemini: hero videosunun son karesi (ekrana göre yatay ya da dikey)
const cellsBackdrop = { ...heroVideo, portraitQuery: PORTRAIT_QUERY };

export default function Home() {
  return (
    <>
      <Hero />
      {/*
        Hero videosu mikroskobun içindeki hücrelerde bitiyor. Hakkımda,
        hero'nun son ekranının altına bindirilmiş durumda ve üstünde aynı
        karenin resmi var; video bittiği anda hücreler pencereye dönüşüp
        büyüyerek Hakkımda'yı açıyor. Açılma bitince sayfa normal akar.
      */}
      <ScrollMask variant="cells" cells={heroCells} backdrop={cellsBackdrop} overlapPrevious>
        <About />
      </ScrollMask>
      <Projects />
      <Experience />
      <Contact />
    </>
  );
}
