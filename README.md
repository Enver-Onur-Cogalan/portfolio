# Portfolio Website

A modern, responsive portfolio website built with Next.js 16, featuring a glass-brutalist design aesthetic with smooth GSAP animations and interactive chatbot.

**Live Demo:** https://portfolio-sand-two-79.vercel.app

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | GSAP |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

### Dependencies

- `next` - React framework with App Router
- `react` / `react-dom` - UI library
- `gsap` - Animation library
- `lucide-react` - Icon library
- `tailwindcss` - Utility-first CSS framework

---

## Project Structure

```
portfolio/
├── public/
│   └── portfolio-music.mp3      # Background music track
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts     # Chatbot API endpoint
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   └── globals.css           # Global styles + CSS variables
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatMessage.tsx  # Chat message component
│   │   │   └── ChatWidget.tsx   # Interactive chatbot widget
│   │   ├── layout/
│   │   │   ├── Footer.tsx       # Footer section
│   │   │   └── Header.tsx       # Header with mobile hamburger menu
│   │   ├── sections/
│   │   │   ├── About.tsx        # About section
│   │   │   ├── Contact.tsx      # Contact section
│   │   │   ├── Experience.tsx   # Experience timeline
│   │   │   ├── Hero.tsx         # Hero section
│   │   │   ├── Philosophy.tsx   # Philosophy quotes
│   │   │   ├── Projects.tsx     # Projects showcase
│   │   │   └── Skills.tsx       # Skills grid
│   │   └── ui/
│   │       ├── LanguageToggle.tsx   # Language switcher (TR/EN)
│   │       ├── MusicPlayer.tsx      # Audio player with lyrics
│   │       └── ThemeToggle.tsx      # Light/Dark theme switcher
│   ├── context/
│   │   ├── LanguageContext.tsx  # i18n context provider
│   │   └── ThemeContext.tsx     # Theme context provider
│   ├── data/
│   │   └── music.ts             # Music lyrics data
│   ├── lib/
│   │   ├── chat/
│   │   │   ├── matcher.ts       # Keyword matching engine
│   │   │   └── responses.ts     # Q&A response data
│   │   └── gsap.ts              # GSAP configuration
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── package.json
└── tsconfig.json
```

---

## Features

- **Responsive Design** - Mobile-first approach with hamburger menu
- **Dark/Light Theme** - System preference detection with manual toggle
- **Bilingual Support** - Turkish and English languages
- **Smooth Animations** - GSAP-powered scroll and entrance animations
- **Interactive Chatbot** - Rule-based FAQ chatbot
- **Music Player** - Background music with synchronized lyrics
- **Glass UI Elements** - Frosted glass aesthetic with backdrop blur

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm / bun

### Installation

```bash
# Clone the repository
git clone https://github.com/Enver-Onur-Cogalan/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Sections

| Section | Description |
|---------|-------------|
| **Hero** | Introduction with role title and CTA |
| **About** | Personal stats and biography |
| **Philosophy** | Three guiding principles |
| **Skills** | Technical stack grid |
| **Projects** | Featured work showcase |
| **Experience** | Education and work timeline |
| **Contact** | Email and social links |

---

## API Endpoints

### POST `/api/chat`

Send a message to the chatbot.

**Request:**
```json
{
  "message": "Projelerin hakkında bilgi ver",
  "lang": "tr"
}
```

**Response:**
```json
{
  "response": "Portfolio' da 3 proje bulunuyor...",
  "typingDelay": 500,
  "showOptions": true
}
```

---

## License

MIT License - feel free to use this template for your own portfolio.
