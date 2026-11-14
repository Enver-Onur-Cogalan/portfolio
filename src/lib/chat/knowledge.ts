import { projects, experiences, type Project, type Experience } from '@/data/portfolio';
import { translate, type Language } from '@/i18n/translations';
import { normalize, tokenize } from './normalize';
import type { SectionId } from './responses';

/*
  Botun bildiği "şeyler": projeler ve deneyimler.

  Hepsi sitenin verisinden üretiliyor; burada hiçbir proje adı elle
  yazılmıyor. Sitede bir proje eklenince ya da kaldırılınca bot da onu
  kendiliğinden biliyor ya da unutuyor. (Eskiden cevaplar elle
  yazılıydı; projeler sitede kaldırıldıktan sonra bot onları anlatmaya
  devam ediyordu.)

  Takma adlar: başlık, kimlik ve aşağıdaki ek liste. Ek liste yalnızca
  insanların gerçekte nasıl yazdığını kapsıyor ("hava uygulaması",
  "bu site"); proje bilgisi içermiyor.
*/

export type EntityKind = 'project' | 'work' | 'education';

export interface Entity {
  id: string;
  kind: EntityKind;
  name: string;
  /** Normalleştirilmiş, kelimelere bölünmüş takma adlar */
  aliases: string[][];
}

const EXTRA_ALIASES: Record<string, string[]> = {
  weatherapp: ['weather app', 'weather', 'hava', 'hava durumu', 'hava uygulamasi', 'hava app'],
  memefile: ['meme file', 'meme', 'meme uygulamasi', 'tepki videosu uygulamasi'],
  portfolio: ['portfolyo', 'bu site', 'bu sitenin', 'site', 'websitesi', 'web sitesi', 'this site', 'this website', 'website'],
  unimall: ['uni mall', 'e ticaret', 'eticaret', 'ocr', '22 milyon'],
  ege: ['ege universitesi', 'ege university'],
  patika: ['patika dev', 'bootcamp'],
};

function aliasesFor(id: string, title: string): string[][] {
  const raw = [title, id, title.replace(/\s+/g, ''), ...(EXTRA_ALIASES[id] ?? [])];
  const unique = [...new Set(raw.map(normalize))];
  return unique.map(tokenize).filter((alias) => alias.length > 0);
}

export const entities: Entity[] = [
  ...projects.map((p) => ({ id: p.id, kind: 'project' as const, name: p.title, aliases: aliasesFor(p.id, p.title) })),
  ...experiences.map((e) => ({
    id: e.id,
    kind: e.type === 'work' ? ('work' as const) : ('education' as const),
    name: e.title,
    // Başlık "Ege Üniversitesi", "Patika+ React Native Bootcamp" gibi
    // uzun olabiliyor; ilk kelime de tek başına yetsin
    aliases: aliasesFor(e.id, e.title).concat(e.title.includes(' ') ? [tokenize(normalize(e.title.split(' ')[0]))] : []),
  })),
];

export const findEntity = (id: string | null | undefined) => entities.find((e) => e.id === id) ?? null;
const findProject = (id: string) => projects.find((p) => p.id === id);
const findExperience = (id: string) => experiences.find((e) => e.id === id);

// ─── Cevap üreticiler ────────────────────────────────────────

export interface Answer {
  text: string;
  sectionId?: SectionId;
  /** Takip önerileri (topicCatalog anahtarları) */
  suggests?: string[];
}

const t = translate;
const L = (lang: Language, tr: string, en: string) => (lang === 'tr' ? tr : en);

/** Çeviri yoksa (anahtar geri dönüyorsa) boş */
function maybe(lang: Language, key: string): string {
  const value = t(lang, key);
  return value === key ? '' : value;
}

function projectHeadline(lang: Language, p: Project): string {
  return p.headline ? maybe(lang, `projects.${p.id}.headline`) : '';
}

function projectDesc(lang: Language, p: Project): string {
  return maybe(lang, `projects.${p.id}.desc`) || p.description;
}

function projectLinks(lang: Language, p: Project): string {
  const lines = [`GitHub: ${p.github}`];
  if (p.download) lines.push(L(lang, `İndir (Windows): ${p.download}`, `Download (Windows): ${p.download}`));
  return lines.join('\n');
}

/** Bir projeyle ilgili bir sonraki mantıklı sorular */
function projectSuggests(p: Project, except: string): string[] {
  const options = [`${p.id}:approach`, `${p.id}:result`, `${p.id}:tech`, `${p.id}:link`].filter((s) => !s.endsWith(except));
  return [...options.slice(0, 2), 'projeler'];
}

function experienceSuggests(e: Experience, except: string): string[] {
  const options = e.caseStudy ? [`${e.id}:approach`, `${e.id}:result`] : [];
  if (e.tech?.length) options.push(`${e.id}:tech`);
  return [...options.filter((s) => !s.endsWith(except)).slice(0, 2), 'deneyim'];
}

export type EntityIntent = 'detail' | 'link' | 'tech' | 'problem' | 'approach' | 'result' | 'download';

/** Bir varlık hakkında belirli bir soruya cevap */
export function answerAbout(lang: Language, entity: Entity, intent: EntityIntent): Answer {
  if (entity.kind === 'project') {
    const p = findProject(entity.id)!;
    const sectionId: SectionId = 'projeler';
    switch (intent) {
      case 'link':
        return {
          text: L(lang, `${p.title} kaynak kodu:\n${projectLinks(lang, p)}`, `${p.title} source code:\n${projectLinks(lang, p)}`),
          sectionId,
          suggests: projectSuggests(p, 'link'),
        };
      case 'download':
        return {
          text: p.download
            ? L(lang, `${p.title} kurulum dosyası burada; kurulan uygulama yeni sürümleri kendisi alıyor:\n${p.download}`, `${p.title} installer is here; once installed it updates itself:\n${p.download}`)
            : L(lang, `${p.title}'in indirilebilir bir sürümü yok, ama kaynak kodu açık:\n${p.github}`, `${p.title} has no download, but the source is open:\n${p.github}`),
          sectionId,
          suggests: projectSuggests(p, 'download'),
        };
      case 'tech':
        return {
          text: L(lang, `${p.title} ile kullanılan teknolojiler:\n${p.technologies.join(' · ')}`, `Tech behind ${p.title}:\n${p.technologies.join(' · ')}`),
          sectionId,
          suggests: projectSuggests(p, 'tech'),
        };
      case 'problem':
      case 'approach':
      case 'result': {
        const text = p.caseStudy?.includes(intent) ? maybe(lang, `projects.${p.id}.${intent}`) : '';
        if (!text) return answerAbout(lang, entity, 'detail');
        return {
          text: `${p.title} · ${t(lang, `experience.block.${intent}`)}\n\n${text}`,
          sectionId,
          suggests: projectSuggests(p, intent),
        };
      }
      default: {
        const headline = projectHeadline(lang, p);
        return {
          text: [headline ? `${p.title}: ${headline}` : p.title, projectDesc(lang, p), projectLinks(lang, p)].join('\n\n'),
          sectionId,
          suggests: projectSuggests(p, 'detail'),
        };
      }
    }
  }

  // Deneyim (iş ya da eğitim)
  const e = findExperience(entity.id)!;
  const sectionId: SectionId = 'deneyimler';
  const period = t(lang, e.periodKey);
  const subtitle = maybe(lang, `experience.${e.id}.subtitle`) || e.subtitle;
  const desc = maybe(lang, `experience.${e.id}.desc`) || e.description;

  switch (intent) {
    case 'tech':
      if (e.tech?.length) {
        return {
          text: L(lang, `${e.title}'da kullanılanlar:\n${e.tech.join(' · ')}`, `What ${e.title} involved:\n${e.tech.join(' · ')}`),
          sectionId,
          suggests: experienceSuggests(e, 'tech'),
        };
      }
      break;
    case 'problem':
    case 'approach':
    case 'result': {
      // Envagro'nun anlatısı "problem" yerine "bağlam" ile başlıyor
      const block = intent === 'problem' && !e.caseStudy?.includes('problem') ? 'context' : intent;
      const text = e.caseStudy?.includes(block) ? maybe(lang, `experience.${e.id}.${block}`) : '';
      if (text) {
        const metrics =
          intent === 'result' && e.metrics?.length
            ? '\n\n' + e.metrics.map((m) => `• ${m.value} ${t(lang, `experience.${e.id}.metric.${m.key}`)}`).join('\n')
            : '';
        return {
          text: `${e.title} · ${t(lang, `experience.block.${block}`)}\n\n${text}${metrics}`,
          sectionId,
          suggests: experienceSuggests(e, intent),
        };
      }
      break;
    }
  }

  const headline = maybe(lang, `experience.${e.id}.headline`);
  return {
    text: [`${e.title} · ${subtitle} · ${period}`, headline, desc].filter(Boolean).join('\n\n'),
    sectionId,
    suggests: experienceSuggests(e, 'detail'),
  };
}

/** Öneri düğmesi etiketi ve gönderilecek metin: "weatherapp:tech" gibi anahtarlar için */
export function entitySuggestion(key: string, lang: Language): { label: string; query: string } | null {
  const [id, intent] = key.split(':');
  const entity = findEntity(id);
  if (!entity || !intent) return null;
  const labels: Record<string, [string, string]> = {
    approach: ['Nasıl yapıldı?', 'How was it built?'],
    result: ['Sonuç ne oldu?', 'What came of it?'],
    tech: ['Hangi teknolojiler?', 'Which tech?'],
    link: ['GitHub linki', 'GitHub link'],
    problem: ['Hangi problemi çözüyor?', 'What problem?'],
    download: ['İndir', 'Download'],
  };
  const queries: Record<string, [string, string]> = {
    approach: ['nasıl yapıldı', 'how was it built'],
    result: ['sonucu ne', 'what was the result'],
    tech: ['hangi teknolojiler', 'which technologies'],
    link: ['github linki', 'github link'],
    problem: ['hangi problemi çözüyor', 'what problem does it solve'],
    download: ['indir', 'download'],
  };
  if (!labels[intent]) return null;
  const pick = (pair: [string, string]) => (lang === 'tr' ? pair[0] : pair[1]);
  return { label: `${entity.name}: ${pick(labels[intent])}`, query: `${entity.name} ${pick(queries[intent])}` };
}
