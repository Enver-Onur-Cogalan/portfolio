# Portfolio

[English](README.md) · **Türkçe**

Biyolog olarak başladım, şimdi deneklerim yapay zeka modelleri. İyi haber: hiçbiri ısırmıyor.

Bu benim kişisel sitem. İçinde LLM'siz konuşan bir sohbet botu, kaydırma tekerleğiyle sürdüğün bir mikroskop videosu, gününü yaşayan çizgi hâlimle küçük bir şerit ve olmaması gereken bir yere saklanmış bir motor oyunu var.

**Canlı:** https://enveronurcogalan.vercel.app

---

## Öne çıkanlar

- **Bilerek LLM'siz bir bot.** Kural tabanlı ve iki dilli (TR/EN). Mesaj başına maliyeti sıfır, uydurmuyor. Her cevap sitenin gösterdiği veriden üretiliyor. Yazım hatalarını, Türkçe ekleri ve takip sorularını ("peki linki?") anlıyor. 232 tek mesaj ve 19 konuşma adımlık altın test seti onu dürüst tutuyor.
- **Kaydırmaya bağlı hero.** Mikroskop videosu kaydırma konumuyla ileri geri sarılıyor. Hakkımda'ya geçiş (hücreye dalış, sonra sayfaya erime) tamamen kaydırma konumunun fonksiyonu. Aşağı da yukarı da, Safari'de de aynı davranıyor.
- **Çizgi şerit.** Hakkımda bölümünde mikroskop, masa, kahve, oyun ve motosiklet arasında gezen, gece-gündüz döngüsü olan bir çizgi figür var.
- **Gizli oyun.** Var olmayan bir sayfaya git. (Ya da bota sıkıldığını söyle.)
- **Küçük ve hızlı.** Next/React dışındaki tek çalışma zamanı bağımlılıkları GSAP ve Lucide. Lighthouse masaüstü: 100 / 100 / 100 / 100.
- **Güvenlik başlıkları.** Sıkı CSP (yalnızca `'self'`), çerçeveleme koruması ve kısıtlı Permissions-Policy.

---

## Teknolojiler

| Alan | Kullanılan |
|------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Arayüz | React 19 |
| Dil | TypeScript (strict) |
| Stil | Tailwind CSS v4 |
| Animasyon | GSAP + ScrollTrigger |
| İkonlar | Lucide React |
| Testler | Node'un yerleşik test çalıştırıcısı |
| Dağıtım | Vercel |

Proje yapısı, botun dosya dosya mimarisi ve API örnekleri için [İngilizce README](README.md)'ye bak; kod yorumları zaten Türkçe.

---

## Mimari notlar

**Çeviriler tek kaynaktan.** `src/i18n/translations.ts` hem istemci (`LanguageContext`) hem sunucu (bot cevapları) tarafından okunur. Bot cevaplarındaki proje ve deneyim listeleri `data/portfolio.ts`'ten üretilir; oraya eklenen yeni bir kayıt bota da otomatik olarak öğretilmiş olur.

**Sohbet bağlamı istemcide.** Bağlam (`lastTopic`, `recentTopics`, `lastEntity`, `lastIntent`) `ChatWidget` içinde tutulur ve her istekle gönderilir. Sunucuda durum tutulmaz; sunucusuz ortamda ziyaretçiler birbirinin bağlamını göremez.

**Bot nasıl düşünüyor:** mesaj → küfür kontrolü → normalleştirme → varlık + niyet → bağlam → cevap. Bilmediği bir şey sorulunca tahmin etmek yerine bilmediğini söyler ve bildiklerini önerir.

**Tema React'tan önce uygulanır.** `layout.tsx` içindeki engelleyici betik `html`'e `dark` sınıfını React çalışmadan önce ekler. Context bu harici duruma `useSyncExternalStore` ile abone olur; koyu tema tercih eden ziyaretçi beyaz flaş görmez, hydration uyuşmazlığı oluşmaz.

**Kaydırma animasyonları kaydırma olaylarıyla aç/kapa yapmaz.** Her geçiş yalnızca kaydırma konumundan hesaplanır. Daha önceki maskeli geçiş görünürlüğü kaydırma olaylarıyla değiştiriyordu ve Safari'de yukarı kaydırınca bozuluyordu; ders alındı.

**Deneyimler vaka çalışması olabilir.** Bir deneyime `caseStudy`, `metrics` ve `headline` eklendiğinde zaman çizelgesi kartı katlanabilir Problem / Yaklaşım / Sonuç blokları ve ölçüm şeridiyle gösterilir.

---

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # üretim derlemesi
npm test         # birim testleri (botun altın seti, küfür filtresi)
npm run lint     # ESLint
```

Videolar için [ffmpeg](https://ffmpeg.org/) gerekli: `scripts/encode-hero-video.sh` ve `scripts/encode-project-media.sh`. Her kodlama kararının gerekçesi betiklerin başında yazıyor.

---

## Lisans

Kod [MIT](LICENSE) lisanslı. İçerik (metinler, fotoğraf, CV, proje videoları ve müzik) bu lisansa dahil değil; tüm hakları saklı.
