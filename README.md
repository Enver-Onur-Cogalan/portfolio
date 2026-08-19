# Portfolio

Enver Onur Çoğalan'ın kişisel portfolyo sitesi. Next.js 16 (App Router), GSAP animasyonları, kural tabanlı iki dilli bir sohbet botu ve senkron sözlü müzik çalar içerir.

**Canlı:** https://portfolio-sand-two-79.vercel.app

---

## Teknolojiler

| Alan | Kullanılan |
|------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Dil | TypeScript (strict) |
| Stil | Tailwind CSS v4 |
| Animasyon | GSAP + ScrollTrigger |
| Arama | Fuse.js (sohbet botu yazım hatası toleransı) |
| İkonlar | Lucide React |
| Dağıtım | Vercel |

---

## Proje Yapısı

```
src/
├── app/
│   ├── api/chat/route.ts      # Sohbet botu uç noktası (hız sınırlı)
│   ├── layout.tsx             # Kök düzen, metadata, JSON-LD, tema scripti
│   ├── page.tsx               # Ana sayfa
│   ├── globals.css            # CSS değişkenleri ve tema
│   ├── opengraph-image.tsx    # Paylaşım görseli (çalışma anında üretilir)
│   ├── robots.ts              # robots.txt
│   └── sitemap.ts             # sitemap.xml
├── components/
│   ├── chat/                  # ChatWidget, ChatMessage
│   ├── layout/Header.tsx      # Üst çubuk + mobil menü
│   ├── sections/              # Hero, About, Projects, Experience, Contact
│   └── ui/                    # LanguageToggle, ThemeToggle, MusicPlayer, ...
├── context/                   # Tema ve dil sağlayıcıları
├── data/
│   ├── portfolio.ts           # Projeler, deneyimler, teknoloji listesi
│   └── music.ts               # Şarkı sözü zaman damgaları
├── i18n/translations.ts       # TR/EN çeviri sözlüğü (tek kaynak)
└── lib/
    ├── chat/                  # matcher, responses, profanity (+ testi)
    └── gsap.ts                # GSAP eklenti kaydı
```

---

## Mimari Notlar

**Çeviriler tek kaynaktan.** `src/i18n/translations.ts` hem istemci (`LanguageContext`) hem sunucu (bot yanıtları) tarafından okunur. Bot yanıtlarındaki proje ve deneyim listeleri `data/portfolio.ts`'ten üretilir — yeni bir deneyim eklendiğinde bot da onu bilir, ayrıca güncellenmesi gerekmez.

**Sohbet bağlamı istemcide.** Konuşma bağlamı (`lastTopic`, `recentTopics`) `ChatWidget` içinde tutulur ve her istekle gönderilir. Sunucuda durum tutulmaz; sunucusuz ortamda ziyaretçilerin birbirinin bağlamını görmesi bu şekilde engellenir.

**Tema React'tan önce uygulanır.** `layout.tsx` içindeki engelleyici script, `html` etiketine `dark` sınıfını React çalışmadan önce ekler. Context bu harici duruma `useSyncExternalStore` ile abone olur; böylece koyu tema tercih eden ziyaretçi beyaz flaş görmez ve hydration uyuşmazlığı oluşmaz.

**Deneyimler vaka çalışması olabilir.** Bir deneyime `caseStudy`, `metrics` ve `headline` alanları eklendiğinde zaman çizelgesi kartı otomatik olarak katlanabilir Problem/Yaklaşım/Sonuç blokları ve ölçüm şeridi ile render edilir.

---

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # üretim derlemesi
npm test         # birim testleri
npm run lint     # ESLint
```

---

## Sohbet Botu API'si

### POST `/api/chat`

**İstek**
```json
{
  "message": "projelerin neler",
  "lang": "tr",
  "context": { "lastTopic": null, "recentTopics": [] },
  "quickReplyId": "4"
}
```

`lang` verilmezse `tr` varsayılır. `context` isteğe bağlıdır; önceki yanıttan gelen değer geri gönderilirse bot takip sorularını ("peki github?") anlar. `quickReplyId` yalnızca hızlı yanıt düğmelerinde kullanılır.

**Yanıt**
```json
{
  "response": "İşte Onur'un öne çıkan projeleri: ...",
  "showOptions": false,
  "sectionId": "projeler",
  "autoScrollDelay": 2000,
  "typingDelay": 900,
  "context": { "lastTopic": "projeler", "recentTopics": ["projeler"] }
}
```

`sectionId` doluysa istemci mesajın altında ilgili bölüme götüren bir bağlantı gösterir.

**Sınırlar:** mesaj başına 500 karakter, IP başına dakikada 40 istek (aşılırsa `429`).

---

## Lisans

MIT
