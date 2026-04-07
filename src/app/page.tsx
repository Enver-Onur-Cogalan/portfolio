'use client';

import { useState } from 'react';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Experience from '@/components/sections/Experience';
import Contact from '@/components/sections/Contact';

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  return (
    <>
      <Hero onVideoEnd={() => setShowContent(true)} />
      <div
        className={`transition-opacity duration-700 ${
          showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <About />
        <Projects />
        <Experience />
        <Contact />
      </div>
    </>
  );
}
