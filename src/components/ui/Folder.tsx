'use client';

import { useState, type ReactNode, type CSSProperties, type MouseEvent } from 'react';

/*
  Açılıp içinden kâğıtların çıktığı klasör.
  Kaynak: React Bits — Folder bileşeni (açık kaynak), projeye uyarlandı.

  Uyarlamalar:
  - Kâğıtlar tıklanabilir içerik taşıyor; klasör açıkken kâğıda tıklamak
    klasörü kapatmasın diye olay yayılımı durduruluyor.
  - Renkler tema değişkenlerinden geliyor.
  - Klavye ile açılıp kapanabiliyor, ekran okuyucuya durumu bildiriliyor.
*/

interface FolderProps {
  color?: string;
  size?: number;
  items?: ReactNode[];
  className?: string;
  label?: string;
  openLabel?: string;
  closeLabel?: string;
}

/*
  Klasörün arka kapağı ön yüzünden bir tık koyu olmalı. Bunu eskiden hex
  ayrıştıran bir JS yardımcısı yapıyordu; `color` artık `var(--accent)`
  gibi bir CSS ifadesi olabildiği için hesabı tarayıcıya bırakıyoruz.
*/
const darken = (color: string, percent: number): string =>
  `color-mix(in srgb, ${color} ${100 - percent}%, #000)`;

export default function Folder({
  color = 'var(--accent)',
  size = 1,
  items = [],
  className = '',
  label = 'CV',
  openLabel = 'Klasörü aç',
  closeLabel = 'Klasörü kapat',
}: FolderProps) {
  const maxItems = 3;
  // Yalnızca dolu öğeler kâğıda dönüşür; boş yer tutucular klasörden
  // bomboş bir kart çıkmasına yol açıyordu.
  const papers: ReactNode[] = items.slice(0, maxItems).filter(Boolean);

  const [open, setOpen] = useState(false);
  // Vurgu CSS :hover yerine durumla yönetiliyor: kâğıtlar dönüştürülmüş
  // konumda durduğu için hangi kâğıdın hedeflendiği kesin olsun.
  const [hoveredPaper, setHoveredPaper] = useState<number | null>(null);
  const [paperOffsets, setPaperOffsets] = useState<{ x: number; y: number }[]>(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );


  const toggle = () => {
    setOpen((prev) => !prev);
    if (open) setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
  };

  const handlePaperMouseMove = (e: MouseEvent<HTMLDivElement>, index: number) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
    const offsetY = (e.clientY - (rect.top + rect.height / 2)) * 0.15;
    setPaperOffsets((prev) => {
      const next = [...prev];
      next[index] = { x: offsetX, y: offsetY };
      return next;
    });
  };

  const resetPaper = (index: number) => {
    setPaperOffsets((prev) => {
      const next = [...prev];
      next[index] = { x: 0, y: 0 };
      return next;
    });
  };

  const folderStyle = {
    '--folder-color': color,
    '--folder-back-color': darken(color, 12),
    '--paper-1': '#E8E8EA',
    '--paper-2': '#F2F2F4',
    '--paper-3': '#FFFFFF',
  } as CSSProperties;

  return (
    <div style={{ transform: `scale(${size})` }} className={className}>
      <div
        className={`folder ${open ? 'open' : ''}`.trim()}
        style={folderStyle}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label={open ? closeLabel : openLabel}
      >
        <span className="folder__label" aria-hidden="true">
          {label}
        </span>

        <div className="folder__back">
          {papers.map((item, i) => (
            <div
              key={i}
              className={`paper paper-${i + 1} ${open && hoveredPaper === i ? 'is-hovered' : ''}`}
              onMouseMove={(e) => handlePaperMouseMove(e, i)}
              onMouseEnter={() => setHoveredPaper(i)}
              onFocus={() => setHoveredPaper(i)}
              onBlur={() => setHoveredPaper(null)}
              onMouseLeave={() => {
                resetPaper(i);
                setHoveredPaper((prev) => (prev === i ? null : prev));
              }}
              // Kâğıttaki düğmeye basınca klasör kapanmasın
              onClick={(e) => {
                if (open && item) e.stopPropagation();
              }}
              style={
                open
                  ? ({
                      '--magnet-x': `${paperOffsets[i]?.x || 0}px`,
                      '--magnet-y': `${paperOffsets[i]?.y || 0}px`,
                    } as CSSProperties)
                  : undefined
              }
            >
              {/*
                İçerik yalnızca klasör açıkken var. CSS'te pointer-events ile
                engellemek yetmiyordu: klavyeyle sekme yapıp Enter'a basmak
                kapalı klasördeki düğmeyi yine de tetikliyordu.
              */}
              {open ? item : null}
            </div>
          ))}
          <div className="folder__front" />
          <div className="folder__front right" />
        </div>
      </div>
    </div>
  );
}
