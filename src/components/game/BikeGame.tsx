'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { buildBikerSprite, SPRITE_BOX } from './sprite';

/*
  404 sayfasının mini oyunu: çizgi şeridindeki motorcu, üç şeritli bir
  yolda engellerden kaçıyor. Yandan görünüm; şeritler derinlik gibi üst
  üste. Engeller sitenin hikâyesinden: hücre, kahve, böcek (bug), koni.

  Yalnızca 404 sayfasında ve "Oyna"ya basılınca yükleniyor; ana sayfanın
  paketine girmiyor. Kendi kendine başlamıyor.
*/

type Phase = 'ready' | 'running' | 'paused' | 'over';
type Kind = 'cell' | 'coffee' | 'bug' | 'cone';

interface Obstacle {
  kind: Kind;
  lane: number;
  x: number;
  /** Çarpışma genişliği (piksel) */
  w: number;
  spin: number;
}

interface Palette {
  ink: string;
  paper: string;
  accent: string;
  muted: string;
}

const LANES = 3;
const METERS_PER_PX = 1 / 40;
const MILESTONE = 404;
const BEST_KEY = 'bike404.best';

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    ink: get('--foreground', '#1A1A1A'),
    paper: get('--background', '#FAFAF8'),
    accent: get('--accent', '#12B15C'),
    muted: get('--muted', '#6B7280'),
  };
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Gizli pencere vb.: en iyi skor yalnızca bu oturumda kalır
  }
}

// ─── Engel çizimleri: mürekkep çizgisi, birkaç dolgu ─────────

function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, y: number, size: number, P: Palette): void {
  ctx.save();
  ctx.translate(o.x, y);
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = Math.max(1.6, size * 0.06);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size;

  if (o.kind === 'cell') {
    // Hero'daki hücreler: tırtıklı zar ve çekirdek
    ctx.rotate(o.spin);
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r = s * 0.42 * (1 + 0.07 * Math.sin(a * 11));
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r - s * 0.42;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.fillStyle = 'rgba(233, 214, 178, 0.55)';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.06, -s * 0.48, s * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = P.ink;
    ctx.fill();
  } else if (o.kind === 'coffee') {
    // Kahve bardağı ve buharı
    const w = s * 0.5;
    const h = s * 0.55;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h);
    ctx.lineTo(-w * 0.38, 0);
    ctx.lineTo(w * 0.38, 0);
    ctx.lineTo(w / 2, -h);
    ctx.closePath();
    ctx.fillStyle = P.paper;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = P.accent;
    ctx.fillRect(-w * 0.44, -h * 0.62, w * 0.88, h * 0.26);
    ctx.strokeRect(-w * 0.44, -h * 0.62, w * 0.88, h * 0.26);
    ctx.beginPath();
    ctx.ellipse(w * 0.62, -h * 0.55, w * 0.18, h * 0.2, 0, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.lineWidth *= 0.7;
    for (const dx of [-0.14, 0.12]) {
      ctx.beginPath();
      const t = o.spin * 3;
      ctx.moveTo(w * dx, -h - s * 0.06);
      ctx.bezierCurveTo(w * dx + s * 0.08 * Math.sin(t), -h - s * 0.18, w * dx - s * 0.08, -h - s * 0.26, w * dx + s * 0.04, -h - s * 0.36);
      ctx.stroke();
    }
  } else if (o.kind === 'bug') {
    // Böcek: kodun bug'ı; bacaklar yürür gibi kıpırdıyor
    const leg = Math.sin(o.spin * 8) * s * 0.04;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.2, s * 0.3, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.ink;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-s * 0.32, -s * 0.24, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.36, -s * 0.32);
    ctx.quadraticCurveTo(-s * 0.48, -s * 0.5, -s * 0.56, -s * 0.46);
    ctx.moveTo(-s * 0.32, -s * 0.33);
    ctx.quadraticCurveTo(-s * 0.36, -s * 0.54, -s * 0.44, -s * 0.56);
    for (const lx of [-0.16, 0.02, 0.2]) {
      const k = lx === 0.02 ? -leg : leg;
      ctx.moveTo(s * lx, -s * 0.06);
      ctx.lineTo(s * lx + k - s * 0.04, s * 0.02);
    }
    ctx.stroke();
    ctx.strokeStyle = P.paper;
    ctx.lineWidth *= 0.6;
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.36);
    ctx.lineTo(-s * 0.08, -s * 0.04);
    ctx.stroke();
  } else {
    // Trafik konisi
    const w = s * 0.5;
    const h = s * 0.62;
    ctx.beginPath();
    ctx.moveTo(-w * 0.12, -h);
    ctx.lineTo(w * 0.12, -h);
    ctx.lineTo(w * 0.4, -s * 0.06);
    ctx.lineTo(-w * 0.4, -s * 0.06);
    ctx.closePath();
    ctx.fillStyle = '#F59F0A';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = P.paper;
    ctx.beginPath();
    ctx.moveTo(-w * 0.24, -h * 0.55);
    ctx.lineTo(w * 0.24, -h * 0.55);
    ctx.lineTo(w * 0.29, -h * 0.4);
    ctx.lineTo(-w * 0.29, -h * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-w * 0.55, -s * 0.06);
    ctx.lineTo(w * 0.55, -s * 0.06);
    ctx.stroke();
  }
  ctx.restore();
}

const OBSTACLE_WIDTH: Record<Kind, number> = { cell: 0.7, coffee: 0.55, bug: 0.6, cone: 0.5 };

export default function BikeGame({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  // Bileşen yalnızca tarayıcıda yükleniyor (ssr: false), localStorage hazır
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);

  // Oyun durumu: her karede değişiyor, React'e değil ref'e
  const game = useRef({
    phase: 'ready' as Phase,
    lane: 1,
    laneY: 1,
    distance: 0,
    speed: 0,
    spawnIn: 0,
    obstacles: [] as Obstacle[],
    time: 0,
    milestoneAt: -1,
    roadOffset: 0,
  });
  const steer = useRef<(dir: -1 | 1) => void>(() => {});

  const start = useCallback(() => {
    const g = game.current;
    g.phase = 'running';
    g.lane = 1;
    g.laneY = 1;
    g.distance = 0;
    g.speed = 0;
    g.spawnIn = 0.8;
    g.obstacles = [];
    g.milestoneAt = -1;
    setNewBest(false);
    setScore(0);
    setPhase('running');
    canvasRef.current?.focus();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let palette = readPalette();
    let sprite: HTMLImageElement | null = null;
    let width = 0;
    let height = 0;
    const loadSprite = () =>
      buildBikerSprite({ ink: palette.ink, paper: palette.paper, accent: palette.accent })
        .then((image) => (sprite = image))
        .catch(() => (sprite = null));
    loadSprite();

    // Tema değişince renkler ve motorcunun görseli yenilenir
    const themeWatch = new MutationObserver(() => {
      palette = readPalette();
      loadSprite();
    });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = Math.round(Math.min(320, Math.max(220, width * 0.46)));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);

    const g = game.current;
    steer.current = (dir) => {
      if (g.phase !== 'running') return;
      g.lane = Math.max(0, Math.min(LANES - 1, g.lane + dir));
    };

    const laneTop = () => height * 0.2;
    const laneH = () => (height * 0.76) / LANES;
    // Şeridin zemin çizgisi (nesneler bunun üstünde duruyor)
    const groundOf = (lane: number) => laneTop() + laneH() * (lane + 1) - laneH() * 0.14;

    const draw = () => {
      const P = palette;
      ctx.fillStyle = P.paper;
      ctx.fillRect(0, 0, width, height);

      // Ufuk ve şerit çizgileri: kaydıkça akan kesik çizgiler
      ctx.strokeStyle = P.ink;
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, laneTop());
      ctx.lineTo(width, laneTop());
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, laneTop() + laneH() * LANES);
      ctx.lineTo(width, laneTop() + laneH() * LANES);
      ctx.stroke();
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.45;
      for (let i = 1; i < LANES; i++) {
        const y = laneTop() + laneH() * i;
        ctx.setLineDash([18, 16]);
        ctx.lineDashOffset = g.roadOffset;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Uzakta tepeler: tek ince çizgi, yavaş akıyor (derinlik hissi)
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const u = (x + g.roadOffset * 0.15) / 90;
        const y = laneTop() - 10 - Math.sin(u) * 6 - Math.sin(u * 0.37 + 1) * 9;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      const size = laneH() * 0.9;
      // Arkadaki şeritler önce: yukarıdaki şerit uzakta
      const byLane = [...g.obstacles].sort((a, b) => a.lane - b.lane);
      const playerX = width * 0.12;
      const playerY = groundOf(0) + (groundOf(1) - groundOf(0)) * g.laneY;
      const drawPlayer = () => {
        if (!sprite) return;
        const h = laneH() * 1.25;
        const w = h * (SPRITE_BOX.w / SPRITE_BOX.h);
        const bob = g.phase === 'running' ? Math.sin(g.time * 22) * 1 : 0;
        // Görselin zemini (y=120) şeridin zeminine otursun
        const groundInSprite = (120 - SPRITE_BOX.y) / SPRITE_BOX.h;
        ctx.drawImage(sprite, playerX - w * 0.1, playerY - h * groundInSprite + bob, w, h);
        // Hız çizgileri
        if (g.phase === 'running') {
          ctx.strokeStyle = P.muted;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.5;
          for (let i = 0; i < 3; i++) {
            const yy = playerY - h * (0.25 + i * 0.18);
            const len = 14 + ((g.time * 90 + i * 23) % 22);
            ctx.beginPath();
            ctx.moveTo(playerX - w * 0.14 - len, yy);
            ctx.lineTo(playerX - w * 0.14, yy);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      };
      let playerDrawn = false;
      for (const o of byLane) {
        if (!playerDrawn && o.lane > g.laneY) {
          drawPlayer();
          playerDrawn = true;
        }
        drawObstacle(ctx, o, groundOf(o.lane), size, P);
      }
      if (!playerDrawn) drawPlayer();

      // Skor
      ctx.fillStyle = P.ink;
      ctx.font = `600 ${Math.round(Math.max(13, height * 0.055))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.floor(g.distance)} m`, width - 14, laneTop() * 0.55);

      // 404. metre
      if (g.milestoneAt >= 0 && g.time - g.milestoneAt < 2.6) {
        ctx.textAlign = 'center';
        ctx.fillStyle = P.accent;
        ctx.font = `700 ${Math.round(Math.max(14, height * 0.06))}px system-ui, sans-serif`;
        ctx.fillText(t('game.milestone'), width / 2, laneTop() * 0.55);
      }
    };

    const step = (dt: number) => {
      if (g.phase !== 'running') return;
      g.time += dt;
      // Hız artıyor, bir yerde sabitleniyor; ekran genişliğiyle ölçekli
      const base = Math.max(width, 360);
      g.speed = Math.min(base * 0.55 + g.distance * 0.0035 * base, base * 1.35);
      const dx = g.speed * dt;
      g.distance += dx * METERS_PER_PX;
      g.roadOffset += dx;
      g.laneY += (g.lane - g.laneY) * Math.min(1, dt * 14);

      if (g.milestoneAt < 0 && g.distance >= MILESTONE) g.milestoneAt = g.time;

      // Yeni engel: en az bir şerit hep boş kalsın
      g.spawnIn -= dt;
      if (g.spawnIn <= 0) {
        const kinds: Kind[] = ['cell', 'coffee', 'bug', 'cone'];
        const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
        const count = g.distance > 120 && Math.random() < 0.35 ? 2 : 1;
        const size = laneH() * 0.9;
        for (let i = 0; i < count; i++) {
          const kind = kinds[Math.floor(Math.random() * kinds.length)];
          g.obstacles.push({ kind, lane: lanes[i], x: width + size, w: size * OBSTACLE_WIDTH[kind], spin: Math.random() * 6 });
        }
        const gap = Math.max(0.55, 1.25 - g.distance / 900);
        g.spawnIn = gap * (0.8 + Math.random() * 0.5);
      }

      for (const o of g.obstacles) {
        o.x -= dx;
        o.spin += dt;
      }
      g.obstacles = g.obstacles.filter((o) => o.x > -100);

      // Çarpışma: aynı şeritte (geçiş sırasında yakın olduğu şerit) ve tekerlekler arası
      const h = laneH() * 1.25;
      const w = h * (SPRITE_BOX.w / SPRITE_BOX.h);
      const px0 = width * 0.12 + w * 0.05;
      const px1 = width * 0.12 + w * 0.85;
      const lane = Math.round(g.laneY);
      const hit = g.obstacles.some((o) => o.lane === lane && Math.abs(g.laneY - lane) < 0.35 && o.x + o.w * 0.4 > px0 && o.x - o.w * 0.4 < px1);
      if (hit) {
        g.phase = 'over';
        const final = Math.floor(g.distance);
        setScore(final);
        setPhase('over');
        if (final > readBest()) {
          saveBest(final);
          setBest(final);
          setNewBest(true);
        }
      }
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Sekmeden çıkınca dur
    const onVisibility = () => {
      if (document.hidden && g.phase === 'running') {
        g.phase = 'paused';
        setPhase('paused');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      themeWatch.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [t]);

  // Klavye: oyun açıkken oklar sayfayı kaydırmasın, şerit değiştirsin
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = game.current;
      const up = e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W';
      const down = e.key === 'ArrowDown' || e.key === 's' || e.key === 'S';
      if (up || down) {
        if (g.phase === 'running') {
          e.preventDefault();
          steer.current(up ? -1 : 1);
        }
        return;
      }
      if ((e.key === ' ' || e.key === 'Enter') && (g.phase === 'ready' || g.phase === 'over')) {
        if (document.activeElement === canvasRef.current) {
          e.preventDefault();
          start();
        }
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [start, onClose]);

  const resume = () => {
    game.current.phase = 'running';
    setPhase('running');
    canvasRef.current?.focus();
  };

  // Dokunma: tuvalin üst yarısı yukarı, alt yarısı aşağı
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (game.current.phase !== 'running') return;
    const rect = e.currentTarget.getBoundingClientRect();
    steer.current(e.clientY - rect.top < rect.height / 2 ? -1 : 1);
  };

  const buttonClass =
    'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5';

  return (
    <div className="w-full">
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ border: '1.5px solid color-mix(in srgb, var(--foreground) 22%, transparent)' }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-label={t('game.canvasLabel')}
          onPointerDown={onPointerDown}
          className="block w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        />

        {phase !== 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center" style={{ background: 'color-mix(in srgb, var(--background) 72%, transparent)' }}>
            {phase === 'over' ? (
              <>
                <p className="font-heading font-bold text-2xl" style={{ color: 'var(--foreground)' }}>
                  {t('game.over').replace('{m}', String(score))}
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {newBest ? t('game.newBest') : t('game.best').replace('{m}', String(best))}
                </p>
                <button type="button" onClick={start} className={buttonClass} style={{ background: 'var(--accent)', color: '#05140b' }}>
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  {t('game.retry')}
                </button>
              </>
            ) : phase === 'paused' ? (
              <button type="button" onClick={resume} className={buttonClass} style={{ background: 'var(--accent)', color: '#05140b' }}>
                <Play className="w-4 h-4" aria-hidden="true" />
                {t('game.resume')}
              </button>
            ) : (
              <>
                <p className="text-sm max-w-sm" style={{ color: 'var(--foreground)' }}>
                  {t('game.howTo')}
                </p>
                <button type="button" onClick={start} className={buttonClass} style={{ background: 'var(--accent)', color: '#05140b' }}>
                  <Play className="w-4 h-4" aria-hidden="true" />
                  {t('game.start')}
                </button>
                {best > 0 && (
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {t('game.best').replace('{m}', String(best))}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Dokunmatik ve klavyesiz kullanım için şerit düğmeleri. Ortada:
          köşelerde sohbet ve müzik düğmeleri sabit duruyor, üstlerine biniyordu. */}
      <div className="mt-3 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => steer.current(-1)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ border: '1.5px solid var(--accent)', color: 'var(--foreground)' }}
            aria-label={t('game.up')}
          >
            <ChevronUp className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => steer.current(1)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ border: '1.5px solid var(--accent)', color: 'var(--foreground)' }}
            aria-label={t('game.down')}
          >
            <ChevronDown className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <button type="button" onClick={onClose} className="text-sm underline underline-offset-4" style={{ color: 'var(--muted)' }}>
          {t('game.close')}
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {phase === 'over' ? t('game.over').replace('{m}', String(score)) : ''}
      </p>
    </div>
  );
}
