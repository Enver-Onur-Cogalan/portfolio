'use client';

import { useState, useEffect, useRef } from 'react';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Experience from '@/components/sections/Experience';
import Contact from '@/components/sections/Contact';

export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const prevShowContent = useRef(showContent);

  useEffect(() => {
    if (showContent && !prevShowContent.current) {
      // First transition from black screen
      setTransitionKey(k => k + 1);
    } else if (!showContent && prevShowContent.current) {
      // Returned to black screen - prepare for next transition
      prevShowContent.current = showContent;
    }
    prevShowContent.current = showContent;
  }, [showContent]);

  return (
    <>
      <Hero onVideoEnd={() => setShowContent(true)} />
      <div
        key={transitionKey}
        className={`transition-all duration-1000 ease-out ${
          showContent
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 blur-xl -translate-y-12 pointer-events-none'
        }`}
        style={{
          backdropFilter: showContent ? 'blur(0px)' : 'blur(20px)',
          WebkitBackdropFilter: showContent ? 'blur(0px)' : 'blur(20px)',
        }}
      >
        <About />
        <Projects />
        <Experience />
        <Contact />
      </div>
    </>
  );
}
