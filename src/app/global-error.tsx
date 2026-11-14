'use client';

/*
  Kök düzenin kendisi çöktüğünde. Bu dosya düzenin yerine geçiyor: sitenin
  stilleri, fontları, tema ve dil bağlamı burada yok. Bu yüzden her şey
  satır içi ve iki dilde; koyu zemin sitenin koyu temasıyla aynı.
*/
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          color: '#FAFAF8',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <title>Bir şeyler ters gitti · Something went wrong</title>
        <main style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Bir şeyler ters gitti.</h1>
          <p style={{ color: '#9CA3AF', margin: '8px 0 0' }}>Something went wrong.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{ background: '#2EE07C', color: '#05140b', border: 0, borderRadius: 999, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
            >
              Tekrar dene · Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
