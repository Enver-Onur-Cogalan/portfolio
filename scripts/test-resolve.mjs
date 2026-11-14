// `npm test` için: Node, TypeScript'in "@/..." kısayolunu ve uzantısız
// göreli importları kendiliğinden çözemiyor. Bu kanca yalnızca testler
// çalışırken devrede; Next derlemesi kendi çözümleyicisini kullanıyor.
import { register } from 'node:module';

register('./test-resolve-hooks.mjs', import.meta.url);
