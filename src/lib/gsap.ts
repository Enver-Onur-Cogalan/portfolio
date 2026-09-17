'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
/*
  `gsap/Flip` yerine `gsap/src/Flip`: paketteki tip dosyası `flip.d.ts`
  küçük harfle, `gsap/Flip` ise onu `Flip.d.ts` olarak arıyor. macOS'un
  harf duyarsız dosya sisteminde TypeScript bunu iki ayrı dosya sanıp
  derlemeyi durduruyor. `src` yolu aynı eklentinin ESM kaynağı ve tipleri
  paketin kendi `declare module` bildiriminden geliyor.
*/
import { Flip } from 'gsap/src/Flip';

if (typeof window !== 'undefined') {
  // Flip: öne çıkan projeler vitrininde kartların yer ve boyut değiştirmesi.
  // Kurulu `gsap` paketinin parçası, ayrı bağımlılık değil.
  gsap.registerPlugin(ScrollTrigger, Flip);
}

export { gsap, Flip, ScrollTrigger };
