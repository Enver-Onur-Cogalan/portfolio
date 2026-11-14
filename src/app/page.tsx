import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Experience from '@/components/sections/Experience';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      {/*
        Hero, kamera hücreye dalıp görüntü arka plan rengine eriyerek
        bitiyor; Hakkımda hemen ardından normal akışla geliyor. Arada maske
        ya da bindirme yok: geçiş tamamen hero'nun içinde ve yalnızca
        kaydırma konumuna bağlı, iki yönde de aynı.
      */}
      <About />
      <Projects />
      <Experience />
      <Contact />
    </>
  );
}
