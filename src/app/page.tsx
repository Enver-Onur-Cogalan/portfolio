import Hero from '@/components/sections/Hero';
import ScrollMask from '@/components/ui/ScrollMask';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Experience from '@/components/sections/Experience';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      {/*
        Hero videosu bittiğinde ekran arka plan rengiyle kapalı kalıyor.
        ScrollMask bu örtüyü kaydırmaya bağlı olarak açıp Hakkımda
        bölümünü ortaya çıkarır; açılma bitince sayfa normal akar.
      */}
      <ScrollMask variant="grid">
        <About />
      </ScrollMask>
      <Projects />
      <Experience />
      <Contact />
    </>
  );
}
