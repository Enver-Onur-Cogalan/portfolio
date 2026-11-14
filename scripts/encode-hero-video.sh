#!/usr/bin/env bash
#
# Hero videosunun web sürümlerini üretir.
#
#   scripts/encode-hero-video.sh <kaynak.mp4>
#
# Kaynak 1920×1080 olmalı; elde edilebilecek en yüksek kalitedeki kopya
# verilmeli, çünkü burada yeniden sıkıştırılıyor. Çıktılar public/video/
# altına yazılır:
#
#   hero-landscape.mp4         yatay ekranlar
#   hero-portrait.mp4          dikey ekranlar (ortadan dikey kesim)
#   hero-*-first.webp          ilk kare: video yüklenene kadar poster
#   hero-*-last.webp           son kare: Hakkımda'yı açan maskenin zemini
#
# Kodlama kararları:
#
# - Video kaydırmaya bağlı oynatılıyor (currentTime ile ileri geri
#   aranıyor). Aranan kareye ulaşmak için en yakın anahtar kareden
#   itibaren çözmek gerekir; bu yüzden anahtar kareler sık olmalı.
#   Yatayda 6 karede bir anahtar kare yeterli: her kareyi anahtar yapmaya
#   göre dosya yarıya iniyor, kaydırma ölçümünde fark çıkmadı.
#   Dikeyde (telefonlar) her kare anahtar kare; zayıf işlemcide risk
#   almıyoruz.
# - Dikey sürüm yataydan ortadaki 608 px'lik şerit kesilerek üretiliyor.
#   Telefonda yatay video ekranı kaplamak için büyütüldüğünde zaten
#   yalnızca bu şerit görünüyordu; 540×960 aynı piksel sayısıyla
#   görünen kısmı yaklaşık 1,8 kat daha net veriyor.
# - Kaynak 4,4. saniyede kesiliyor: sonrasında görüntü karanlığa soluyor.
#   Geçiş son kareden başladığı için son kare parlak olmalı; kesilen
#   kısım ayrıca kaydırmada boşa geçen mesafeydi.
# - Ses izi atılıyor: video her zaman sessiz.
# - +faststart: dosya bilgisi başa yazılır, tarayıcı tümünü indirmeden
#   oynatmaya başlayabilir.
#
# Son kareyi değiştiren bir kaynak verilirse src/data/heroVideo.ts'deki
# hücre konumları da yeni kareye göre güncellenmeli.

set -euo pipefail

SRC="${1:?kullanım: $0 <kaynak.mp4>}"
END="${HERO_VIDEO_END:-4.4}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/video"
mkdir -p "$OUT"

# Yataydaki 1920 px genişliğin ortasından 608 px (9:16'ya yakın)
PORTRAIT_CROP="crop=608:1080:656:0,scale=540:960"

x264() {
  ffmpeg -v error -y -i "$SRC" -t "$END" -an "$@"
}

echo "yatay video…"
x264 -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf 23 \
  -x264-params keyint=6:min-keyint=6:scenecut=0:bframes=0 \
  -movflags +faststart "$OUT/hero-landscape.mp4"

echo "dikey video…"
x264 -vf "$PORTRAIT_CROP" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf 23 \
  -x264-params keyint=1 \
  -movflags +faststart "$OUT/hero-portrait.mp4"

# Kareler kodlanmış dosyalardan alınıyor ki video ile birebir aynı olsun;
# maske açılmadan önce video karesinden resme geçiş görünmemeli.
frame() { # <video> <ilk|son> <genişlik> <kalite> <çıktı>
  local seek=(-ss 0)
  [[ "$2" == "last" ]] && seek=(-sseof -0.04)
  ffmpeg -v error -y "${seek[@]}" -i "$1" -frames:v 1 -vf "scale=$3:-2" \
    -c:v libwebp -quality "$4" "$5"
}

echo "kareler…"
frame "$OUT/hero-landscape.mp4" first 1280 72 "$OUT/hero-landscape-first.webp"
frame "$OUT/hero-landscape.mp4" last 1920 74 "$OUT/hero-landscape-last.webp"
frame "$OUT/hero-portrait.mp4" first 540 72 "$OUT/hero-portrait-first.webp"
frame "$OUT/hero-portrait.mp4" last 540 74 "$OUT/hero-portrait-last.webp"

ls -lh "$OUT"
