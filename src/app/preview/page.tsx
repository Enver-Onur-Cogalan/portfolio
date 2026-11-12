'use client';

// GEÇİCİ: çizgi-sanat durağının görsel doğrulaması için. Silinecek.
import { useEffect, useRef } from 'react';
import { createStrip } from '@/components/ink/strip';

export default function Preview() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    return createStrip(node);
  }, []);
  return (
    <main style={{ background: '#ebe8e2', minHeight: '100vh', padding: 24 }}>
      <div
        ref={host}
        id="card"
        style={{
          maxWidth: 960,
          margin: '0 auto',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,.12)',
        }}
      />
    </main>
  );
}
