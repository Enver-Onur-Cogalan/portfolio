import { el } from '@/lib/ink/ink';
import { bikeStation } from '@/components/ink/stations/bike';
import { createFigure } from '@/components/ink/figure';

/*
  Oyuncunun görseli: Hakkımda'daki çizgi şeridinin motosiklet durağı,
  figür motora oturmuş hâlde. Aynı çizim motorundan geliyor, yani oyundaki
  kişi şeritteki kişinin kendisi.

  Bir kez SVG olarak çizilip resme çevriliyor; oyun her karede yalnızca
  bu resmi tuvale basıyor. Çizim motorunun yerel uzayı: zemin y=120,
  figür x=40; motosiklet x≈3–98 arasında.
*/

export interface SpriteColors {
  ink: string;
  paper: string;
  accent: string;
}

/** Görselin yerel uzaydaki kutusu (viewBox) */
export const SPRITE_BOX = { x: 0, y: 28, w: 100, h: 94 };

export function buildBikerSprite(colors: SpriteColors): Promise<HTMLImageElement> {
  const svg = el('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: `${SPRITE_BOX.x} ${SPRITE_BOX.y} ${SPRITE_BOX.w} ${SPRITE_BOX.h}`,
    width: SPRITE_BOX.w * 4,
    height: SPRITE_BOX.h * 4,
  });
  // Resim olarak yüklenen SVG sayfanın CSS'ini görmüyor; renk
  // değişkenleri kökte tanımlanıyor
  svg.setAttribute(
    'style',
    `color:${colors.ink};--accent:${colors.accent};--paper:${colors.paper};--screen:${colors.paper};--lamp-on:0`
  );

  const station = bikeStation(svg);
  const figure = createFigure(svg);
  // Uzak bacak motorun arkasında: binen kişi bacağını öbür tarafa atıyor
  svg.insertBefore(figure.gFar, station.g);

  // Park hâlinin tek işareti yan sehpa; sürüşte yok
  station.g.querySelectorAll('path').forEach((path) => {
    if (path.getAttribute('d')?.startsWith('M46 101 L38.6 118')) path.remove();
  });

  // Oturma geçişi zamanla yumuşuyor; birkaç adımda yerine oturtuluyor
  for (let i = 0; i < 40; i++) {
    figure.update(0.1, { costume: station.costume, go: 0, sit: 1, reach: 1, work: station.work });
  }

  const markup = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    image.src = url;
  });
}
