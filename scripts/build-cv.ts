/*
  CV'yi sitenin verisinden üretir: public/cv.pdf (TR) ve public/cv-en.pdf (EN).

    npm run cv

  Şirket, unvan, dönem, projeler, beceriler ve bağlantılar sitenin kendi
  verisinden geliyor; CV'ye özel kısa metinler src/data/cv.ts'te. Deneyim
  eklendiğinde ya da bir metin değiştiğinde bu komut iki PDF'i de yeniler.

  PDF'i bilgisayardaki Chrome basıyor (yeni bağımlılık yok). Chrome başka
  bir yerdeyse: CHROME_PATH=/yol/chrome npm run cv
  Fontlar Google Fonts'tan çekilip PDF'e gömülüyor; internet gerekli.
*/
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { experiences, projects, skillCategories, socialLinks } from '@/data/portfolio';
import { CV_FILES, SITE_URL } from '@/data/site';
import {
  cvBullets,
  cvEducationNote,
  cvEducationTitle,
  cvLabels,
  cvLanguages,
  cvLocation,
  cvProjects,
  cvRole,
  cvSummary,
} from '@/data/cv';
import { translate, type Language } from '@/i18n/translations';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const NAME = 'Enver Onur Çoğalan';

const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Beceri listesinde Türkçe yazılmış tek kalem
const SKILL_EN: Record<string, string> = { 'Yerel LLM (Ollama)': 'Local LLM (Ollama)' };

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** "https://github.com/x" → "github.com/x" */
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const link = (url: string, text = bare(url)) => `<a href="${escape(url)}">${escape(text)}</a>`;

/** "Ağustos 2025 - Eylül 2025" → "Ağustos 2025 – Eylül 2025" */
const period = (lang: Language, key: string, fallback: string) => {
  const value = translate(lang, key);
  return (value === key ? fallback : value).replace(' - ', ' – ');
};

function photoDataUri(): string {
  const source = path.join(ROOT, 'public/photo.jpg');
  const dir = mkdtempSync(path.join(tmpdir(), 'cv-photo-'));
  const small = path.join(dir, 'photo.jpg');
  try {
    // macOS'ta küçült: 2048 px'lik fotoğraf PDF'i gereksiz şişiriyor
    execFileSync('sips', ['-Z', '360', source, '--out', small], { stdio: 'ignore' });
    return `data:image/jpeg;base64,${readFileSync(small).toString('base64')}`;
  } catch {
    return `data:image/jpeg;base64,${readFileSync(source).toString('base64')}`;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function render(lang: Language, photo: string | null): string {
  const L = cvLabels[lang];

  const work = experiences
    .filter((e) => e.type === 'work')
    .reverse()
    .map((e) => {
      const bullets = cvBullets[e.id]?.[lang] ?? [];
      return `
        <article class="item">
          <div class="row">
            <h3>${escape(translate(lang, `experience.${e.id}.subtitle`) || e.subtitle)} <span class="at">· ${escape(e.title)} · ${escape(cvLocation[e.id]?.[lang] ?? '')}</span></h3>
            <span class="meta">${escape(period(lang, e.periodKey, e.period))}</span>
          </div>
          <ul>${bullets.map((b) => `<li>${escape(b)}</li>`).join('')}</ul>
        </article>`;
    })
    .join('');

  const projectList = projects
    .filter((p) => cvProjects[p.id])
    .map(
      (p) => `
        <article class="item project">
          <div class="row">
            <h3>${escape(p.title)}<span class="tech-inline">${p.technologies.slice(0, 5).map(escape).join(' · ')}</span></h3>
            <span class="meta">${link(p.github)}</span>
          </div>
          <p>${escape(cvProjects[p.id][lang])}</p>
        </article>`
    )
    .join('');

  const education = experiences
    .filter((e) => e.type === 'education')
    .reverse()
    .map(
      (e) => `
        <article class="item edu">
          <div class="row">
            <h3>${escape(cvEducationTitle[e.id]?.[lang] ?? e.title)}<span class="note">${escape(cvEducationNote[e.id]?.[lang] ?? '')} · ${escape(cvLocation[e.id]?.[lang] ?? '')}</span></h3>
            <span class="meta">${escape(period(lang, e.periodKey, e.period))}</span>
          </div>
        </article>`
    )
    .join('');

  const skills = skillCategories
    .map(
      (c) => `
        <div class="skill">
          <span class="skill-title">${escape(translate(lang, c.titleKey))}</span>
          <span>${c.skills.map((s) => escape(lang === 'en' ? (SKILL_EN[s] ?? s) : s)).join(' · ')}</span>
        </div>`
    )
    .join('');

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${NAME} – CV</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=block&subset=latin-ext" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  :root { --ink: #1A1A1A; --muted: #5B6270; --accent: #0E9150; --line: #E3E5E8; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    width: 210mm; min-height: 297mm; padding: 11mm 14mm 10mm;
    font: 8.8pt/1.36 Inter, system-ui, sans-serif; color: var(--ink); background: #fff;
  }
  a { color: inherit; text-decoration: none; }
  h1, h2, h3 { font-family: 'Space Grotesk', Inter, sans-serif; }

  header { display: flex; align-items: center; gap: 6mm; padding-bottom: 3.4mm; border-bottom: 1.4pt solid var(--ink); }
  header img { width: 21mm; height: 21mm; border-radius: 50%; object-fit: cover; }
  header .who { flex: 1; }
  h1 { font-size: 21pt; line-height: 1.05; letter-spacing: -0.02em; }
  .role { font: 600 10.5pt/1.3 'Space Grotesk', sans-serif; color: var(--accent); margin-top: 1mm; }
  .role .place { font: 400 8.6pt Inter, sans-serif; color: var(--muted); margin-left: 1.6mm; }
  .contact { display: flex; flex-wrap: wrap; gap: 0.4mm 4mm; margin-top: 1.4mm; color: var(--muted); font-size: 8.4pt; }

  section { margin-top: 3.6mm; }
  h2 {
    font-size: 8.4pt; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--accent); padding-bottom: 1mm; margin-bottom: 1.8mm; border-bottom: 0.6pt solid var(--line);
  }
  .summary { font-size: 9pt; }

  .item + .item { margin-top: 2.4mm; }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
  h3 { font-size: 10.2pt; font-weight: 700; }
  h3 .at { font-weight: 500; color: var(--muted); }
  .meta { font-size: 8.4pt; color: var(--muted); white-space: nowrap; }
  .sub { font-size: 8.4pt; color: var(--muted); margin-top: 0.3mm; }
  ul { margin-top: 0.8mm; padding-left: 4mm; }
  li { margin-top: 0.2mm; }
  li::marker { color: var(--accent); }
  .project p { margin-top: 0.4mm; }
  .project .row h3 .tech-inline { font: 400 8pt Inter, sans-serif; color: var(--muted); margin-left: 1.6mm; }
  .project .tech { font-size: 8pt; color: var(--muted); margin-top: 0.6mm; }
  .project .meta a { color: var(--accent); }

  .skill { display: grid; grid-template-columns: 38mm 1fr; gap: 3mm; }
  .skill + .skill { margin-top: 0.8mm; }
  .edu .row h3 { font-size: 9.6pt; }
  .edu .row h3 .note { font: 400 8.6pt Inter, sans-serif; color: var(--muted); margin-left: 1.6mm; }
  .skill-title { font-weight: 600; }
</style>
</head>
<body>
  <header>
    ${photo ? `<img src="${photo}" alt="">` : ''}
    <div class="who">
      <h1>${NAME}</h1>
      <div class="role">${escape(cvRole[lang])}<span class="place">${escape(L.location)}</span></div>
      <div class="contact">
        <span>${link(`mailto:${socialLinks.email}`, socialLinks.email)}</span>
        <span>${link(SITE_URL)}</span>
        <span>${link(socialLinks.linkedin)}</span>
        <span>${link(socialLinks.github)}</span>
      </div>
    </div>
  </header>

  <section><h2>${L.summary}</h2><p class="summary">${escape(cvSummary[lang])}</p></section>
  <section><h2>${L.experience}</h2>${work}</section>
  <section><h2>${L.projects}</h2>${projectList}</section>
  <section><h2>${L.education}</h2>${education}</section>
  <section><h2>${L.skills}</h2>${skills}</section>
  <section><h2>${L.languages}</h2><p>${escape(cvLanguages[lang])}</p></section>
</body>
</html>`;
}

function printPdf(html: string, out: string) {
  const dir = mkdtempSync(path.join(tmpdir(), 'cv-'));
  const page = path.join(dir, 'cv.html');
  writeFileSync(page, html);
  try {
    execFileSync(
      CHROME,
      [
        '--headless',
        '--disable-gpu',
        '--no-pdf-header-footer',
        '--run-all-compositor-stages-before-draw',
        // Fontların inmesi için sanal süre tanınıyor
        '--virtual-time-budget=10000',
        `--print-to-pdf=${out}`,
        pathToFileURL(page).href,
      ],
      { stdio: 'ignore' }
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (!existsSync(CHROME)) {
  console.error(`Chrome bulunamadı: ${CHROME}\nCHROME_PATH ile yolunu ver.`);
  process.exit(1);
}

const photo = photoDataUri();
// Yurt dışı başvurularda fotoğraf beklenmiyor; yalnızca Türkçe CV'de var
const variants: { lang: Language; photo: string | null }[] = [
  { lang: 'tr', photo },
  { lang: 'en', photo: null },
];

for (const { lang, photo: image } of variants) {
  const out = path.join(ROOT, 'public', CV_FILES[lang].path);
  const html = render(lang, image);
  if (process.env.CV_HTML) writeFileSync(path.join(process.env.CV_HTML, `cv-${lang}.html`), html);
  printPdf(html, out);
  console.log(`${lang}: ${path.relative(ROOT, out)}`);
}
