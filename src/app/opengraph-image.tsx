import { ImageResponse } from 'next/og';

export const alt = 'Enver Onur Çoğalan — AI Engineer & Mobile Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0A0A0A',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '999px', background: '#22C55E' }} />
          <div style={{ fontSize: 26, color: '#9CA3AF', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Portfolio
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 700, color: '#FAFAF8', lineHeight: 1.05 }}>
            Enver Onur Çoğalan
          </div>
          <div style={{ fontSize: 40, color: '#22C55E', marginTop: '18px' }}>
            AI Engineer &amp; Mobile Developer
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 26, color: '#9CA3AF' }}>
            React Native · Next.js · LLM · STT / TTS
          </div>
          <div style={{ display: 'flex', height: '6px', width: '220px', background: '#22C55E', borderRadius: '999px' }} />
        </div>
      </div>
    ),
    size
  );
}
