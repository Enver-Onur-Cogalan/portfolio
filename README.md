# Portfolio

**English** · [Türkçe](README.tr.md)

I started out as a biologist; these days my test subjects are AI models. Good news: none of them bite.

This is my personal site. It has a chatbot that talks without an LLM, a microscope video you drive with your scroll wheel, a little ink-drawn version of me living his day, and a motorbike game hidden somewhere it shouldn't be.

**Live:** https://enveronurcogalan.vercel.app

---

## Highlights

- **A chatbot with no LLM, on purpose.** It's rule-based and bilingual (TR/EN), so it costs nothing per message and never makes things up. Every answer is built from the same data the site renders. It handles typos, Turkish suffixes and follow-ups ("what about its link?"). A golden test set of 232 single messages and 19 conversation turns keeps it honest.
- **Scroll-driven hero.** The microscope video is scrubbed by scroll position. The transition into About (diving into the cell, then melting into the page) is a pure function of scroll, so it behaves the same scrolling down or up, in Safari too.
- **Ink strip.** The About section has a line-art figure who walks between a microscope, a desk, coffee, games and a motorbike, with a day/night cycle.
- **Hidden game.** Visit a page that doesn't exist. (Or ask the bot whether it's bored.)
- **Small and fast.** The only runtime dependencies besides Next/React are GSAP and Lucide. Lighthouse desktop: 100 / 100 / 100 / 100.
- **Security headers.** Strict CSP (`'self'` only), frame protection and a locked-down Permissions-Policy.

---

## Tech stack

| Area | Used |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animation | GSAP + ScrollTrigger |
| Icons | Lucide React |
| Tests | Node's built-in test runner |
| Hosting | Vercel |

---

## Project structure

```
src/
├── app/
│   ├── api/chat/route.ts      # Chatbot endpoint (rate-limited, profanity filter)
│   ├── layout.tsx             # Root layout, metadata, JSON-LD, theme script
│   ├── page.tsx               # Home page
│   ├── not-found.tsx          # 404 page (and the game's entrance)
│   ├── error.tsx              # Error boundaries
│   ├── global-error.tsx
│   ├── icon.svg, manifest.ts  # Favicon and web app manifest
│   ├── opengraph-image.tsx    # Share image (generated at runtime)
│   └── robots.ts, sitemap.ts
├── components/
│   ├── chat/                  # ChatWidget, ChatMessage
│   ├── game/                  # BikeGame (canvas) and its sprite
│   ├── ink/                   # Ink strip scene: figure, stations
│   ├── layout/                # Header, 404 view, skip link
│   ├── sections/              # Hero, About, Projects, Experience, Skills, Contact
│   └── ui/                    # Theme/language toggles, music player, project media, ...
├── context/                   # Theme and language providers
├── data/
│   ├── portfolio.ts           # Projects, experience, tech list
│   ├── site.ts                # Site URL, CV path
│   ├── heroVideo.ts           # Hero video sources
│   └── music.ts               # Lyric timestamps
├── i18n/translations.ts       # TR/EN dictionary (single source)
└── lib/
    ├── chat/                  # The bot (see below) + tests
    ├── ink/                   # Vendored line-art library (MIT)
    ├── gsap.ts                # GSAP plugin registration
    └── scroll.ts
scripts/
├── encode-hero-video.sh       # Hero video encodes + posters
└── encode-project-media.sh    # Project demo videos + posters
```

---

## How the bot thinks

```
message → profanity check → normalize → entity + intent → context → answer
```

| File | Job |
|------|-----|
| `normalize.ts` | Folds Turkish characters, strips suffixes, tolerates typos |
| `knowledge.ts` | Builds the entities (projects, companies, technologies) from `data/` |
| `intents.ts` | What can be asked: links, tech, results, contact, CV, ... |
| `matcher.ts` | Picks the best entity + intent pair; falls back gracefully |
| `context.ts` | Conversation context, small enough to live in the browser |
| `responses.ts` | The answers, written from the site's data |
| `profanity.ts` | Whole-word and stem matching, so "hello" and "sıkıldım" get through |

When the bot doesn't know something, it says so and suggests what it does know instead of guessing.

---

## Architecture notes

**Translations come from one place.** `src/i18n/translations.ts` is read by both the client (`LanguageContext`) and the server (bot answers). The project and experience lists in bot answers are generated from `data/portfolio.ts`, so a new entry there is automatically known to the bot.

**Chat context lives in the client.** The context (`lastTopic`, `recentTopics`, `lastEntity`, `lastIntent`) is kept in `ChatWidget` and sent with every request. The server holds no state, so on serverless, visitors can never see each other's context.

**The theme is applied before React.** A blocking script in `layout.tsx` adds the `dark` class to `html` before React runs. The context subscribes to that external state with `useSyncExternalStore`, so dark-mode visitors never see a white flash and there is no hydration mismatch.

**Scroll animations never toggle on scroll events.** Every scroll transition is computed from the scroll position alone. An earlier mask transition flipped visibility on scroll events and broke when scrolling back up in Safari; the lesson stuck.

**Experiences can be case studies.** Adding `caseStudy`, `metrics` and `headline` to an experience renders the timeline card with collapsible Problem / Approach / Result blocks and a metrics strip.

---

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm test         # unit tests (bot golden set, profanity filter)
npm run lint     # ESLint
```

### Media

The videos need [ffmpeg](https://ffmpeg.org/).

```bash
# Hero: landscape + portrait cut, first-frame posters → public/video/
scripts/encode-hero-video.sh <source-1920x1080.mp4>

# Project demo: silent looping mp4 + poster → public/projects/<id>/
scripts/encode-project-media.sh <source.mp4|gif> <project-id> <width> [start-s] [duration-s]
```

The hero video is encoded with every frame as a keyframe, because it is scrubbed back and forth. Safari tore frames with sparser keyframes. The reasoning for each choice is in the script headers.

---

## Chatbot API

### POST `/api/chat`

**Request**
```json
{
  "message": "what are your projects",
  "lang": "en",
  "context": { "lastTopic": null, "recentTopics": [], "lastEntity": null, "lastIntent": null }
}
```

`lang` defaults to `tr`. `context` is optional; send back the one from the previous answer and the bot understands follow-ups. The opening "why are you here?" buttons send `visitorPath` (`hiring` | `technical` | `browsing`) with `pathIntro: true`.

**Response**
```json
{
  "response": "Onur's projects: ...",
  "showOptions": false,
  "sectionId": "projeler",
  "suggestions": [{ "id": "weatherapp", "label": "WeatherApp", "query": "WeatherApp" }],
  "typingDelay": 1227,
  "context": { "lastTopic": "projeler", "recentTopics": ["projeler"], "lastEntity": null, "lastIntent": "projects" }
}
```

When `sectionId` is set, the client shows a link to that section under the message. `suggestions` become quick-reply buttons.

**Limits:** 500 characters per message, 40 requests per minute per IP (`429` beyond that).

---

## License

The code is [MIT](LICENSE) licensed. The content (text, photo, CV, project videos and music) is not covered by that license; all rights reserved.
