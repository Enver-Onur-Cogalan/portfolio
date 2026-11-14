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
#
# Kodlama kararları:
#
# - Video kaydırmaya bağlı oynatılıyor (currentTime ile ileri geri
#   aranıyor). Aranan kareye ulaşmak için en yakın anahtar kareden
#   itibaren çözmek gerekir. Her kare anahtar kare (keyint=1).
#   6 karede bir anahtar kare denendi: dosya yarıya iniyordu ve Chrome'da
#   sorun yoktu, ama Safari kaydırırken ara kareleri yarım çiziyordu;
#   ekranın üstü bir kareden, altı başka bir kareden geliyordu.
# - Dikey sürüm yataydan ortadaki 608 px'lik şerit kesilerek üretiliyor.
#   Telefonda yatay video ekranı kaplamak için büyütüldüğünde zaten
#   yalnızca bu şerit görünüyordu; 540×960 aynı piksel sayısıyla
#   görünen kısmı yaklaşık 1,8 kat daha net veriyor.
# - Kaynak 4,4. saniyede kesiliyor: sonrasında görüntü karanlığa
#   soluyordu ve kaydırmada boşa geçen mesafeydi. Geçişi (hücreye dalış
#   ve arka plan rengine erime) sayfa kendisi yapıyor.
# - Ses izi atılıyor: video her zaman sessiz.
# - +faststart: dosya bilgisi başa yazılır, tarayıcı tümünü indirmeden
#   oynatmaya başlayabilir.
#
# Son kareyi değiştiren bir kaynak verilirse src/data/heroVideo.ts'deki
# diveTarget (büyük hücrenin merkezi) yeni kareye göre güncellenmeli.

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
  -x264-params keyint=1 \
  -movflags +faststart "$OUT/hero-landscape.mp4"

echo "dikey video…"
x264 -vf "$PORTRAIT_CROP" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf 23 \
  -x264-params keyint=1 \
  -movflags +faststart "$OUT/hero-portrait.mp4"

# Poster kodlanmış dosyadan alınıyor ki videonun ilk karesiyle birebir
# aynı olsun; video yüklenince posterden videoya geçiş görünmüyor.
poster() { # <video> <genişlik> <çıktı>
  ffmpeg -v error -y -i "$1" -frames:v 1 -vf "scale=$2:-2" -c:v libwebp -quality 72 "$3"
}

echo "posterler…"
poster "$OUT/hero-landscape.mp4" 1280 "$OUT/hero-landscape-first.webp"
poster "$OUT/hero-portrait.mp4" 540 "$OUT/hero-portrait-first.webp"

ls -lh "$OUT"
