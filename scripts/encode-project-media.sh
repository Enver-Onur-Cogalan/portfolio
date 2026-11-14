#!/usr/bin/env bash
#
# Proje vitrinindeki kısa videoları üretir.
#
#   scripts/encode-project-media.sh <kaynak> <proje-id> <genişlik> [başlangıç-sn] [süre-sn]
#
# Kaynak bir video ya da GIF olabilir (repolardaki demo GIF'leri 4–6 MB;
# aynı görüntü H.264 olarak bunun küçük bir kesrine sığıyor). Çıktılar:
#
#   public/projects/<proje-id>/demo.mp4     sessiz, döngüde oynayan video
#   public/projects/<proje-id>/poster.webp  ilk kare: video yüklenene kadar
#                                          ve hareket azaltma tercihinde
#
# Videolar kaydırmaya bağlı değil, düz oynuyor; bu yüzden hero videosunun
# aksine her kareyi anahtar kare yapmaya gerek yok, varsayılan GOP yeterli.

set -euo pipefail

SRC="${1:?kullanım: $0 <kaynak> <proje-id> <genişlik> [başlangıç-sn] [süre-sn]}"
ID="${2:?proje-id gerekli}"
WIDTH="${3:?genişlik gerekli}"
START="${4:-0}"
DURATION="${5:-}"

OUT="$(cd "$(dirname "$0")/.." && pwd)/public/projects/$ID"
mkdir -p "$OUT"

trim=(-ss "$START")
[[ -n "$DURATION" ]] && trim+=(-t "$DURATION")

# Genişlik ve yükseklik çift olmalı (yuv420p); GIF paletinden gelen
# renkler için yuv420p'ye açıkça çevriliyor.
ffmpeg -v error -y "${trim[@]}" -i "$SRC" -an \
  -vf "scale=$WIDTH:-2:flags=lanczos,fps=30,format=yuv420p" \
  -c:v libx264 -preset slow -profile:v high -crf 27 \
  -movflags +faststart "$OUT/demo.mp4"

ffmpeg -v error -y -i "$OUT/demo.mp4" -frames:v 1 -c:v libwebp -quality 78 "$OUT/poster.webp"

ls -lh "$OUT"
