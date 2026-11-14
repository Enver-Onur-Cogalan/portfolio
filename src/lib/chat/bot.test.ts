import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBestMatch } from './matcher.ts';
import { emptyContext, type ConversationContext } from './context.ts';

/*
  Botun altın test seti.

  Her satır: dil, ziyaretçinin yazdığı, beklenen niyet ve (varsa)
  beklenen proje/şirket. Mesajlar bilerek dağınık: yazım hataları,
  Türkçe ekler, büyük/küçük harf, karışık dil. Eski botun yanlış
  cevapladığı sorular da burada; bir daha bozulamazlar.

  Test, doğruluk oranını da yazdırıyor; tek bir hata bile testi düşürür.
*/

type Case = [lang: 'tr' | 'en', message: string, intent: string, entity?: string];

const SINGLE: Case[] = [
  // ─── Selam ve sohbet ───────────────────────────────────
  ['tr', 'merhaba', 'greet'],
  ['tr', 'Selam', 'greet'],
  ['tr', 'slm', 'greet'],
  ['tr', 'sa', 'greet'],
  ['en', 'hello', 'greet'],
  ['en', 'hi there', 'greet'],
  ['en', 'hey', 'greet'],
  ['tr', 'nasılsın', 'howareyou'],
  ['tr', 'selam nasılsın', 'howareyou'],
  ['en', 'how are you?', 'howareyou'],
  ['tr', 'teşekkürler', 'thanks'],
  ['tr', 'tşk', 'thanks'],
  ['en', 'thanks a lot', 'thanks'],
  ['tr', 'görüşürüz', 'bye'],
  ['en', 'bye', 'bye'],

  // ─── Bot ve LLM ────────────────────────────────────────
  ['tr', 'sen kimsin', 'identity'],
  ['tr', 'bot musun?', 'identity'],
  ['en', 'are you a bot', 'identity'],
  ['tr', 'neden LLM yok?', 'whynollm'],
  ['tr', 'LLM kullanıyor musun', 'whynollm'],
  ['tr', 'chatgpt mi bu', 'whynollm'],
  ['en', 'are you an AI?', 'whynollm'],
  ['en', 'why no LLM', 'whynollm'],
  ['tr', 'kural tabanlı mısın', 'whynollm'],
  ['tr', 'ne sorabilirim', 'help'],
  ['en', 'what can you do', 'help'],
  ['tr', 'yardım', 'help'],

  // ─── Onur hakkında ─────────────────────────────────────
  ['tr', 'kendini tanıt', 'about'],
  ['tr', 'Onur kim?', 'about'],
  ['en', 'who is onur', 'about'],
  ['en', 'tell me about yourself', 'about'],
  ['tr', 'ne iş yapıyorsun', 'profession'],
  ['en', 'what does he do', 'profession'],
  ['tr', 'mesleğin ne', 'profession'],
  ['tr', 'eğitimin nedir', 'education'],
  ['tr', 'hangi üniversite', 'education'],
  ['en', 'education', 'education'],
  ['tr', 'biyolojiden nasıl yazılıma geçtin', 'biology'],
  ['en', 'why software after biology', 'biology'],
  ['tr', 'nerede yaşıyorsun', 'location'],
  ['tr', 'nerelisin', 'location'],
  ['en', 'where are you based', 'location'],
  ['tr', 'hobilerin neler', 'hobby'],
  ['tr', 'boş zamanlarında ne yaparsın', 'hobby'],
  ['en', 'what do you do in your free time', 'hobby'],
  ['tr', 'motosiklet kullanıyor mu', 'hobby'],
  ['tr', 'felsefen ne', 'philosophy'],
  ['en', 'what are his principles', 'philosophy'],
  ['tr', 'çalışma tarzın nasıl', 'workstyle'],
  ['en', 'how does he work', 'workstyle'],

  // ─── Yetenekler ve alanlar ─────────────────────────────
  ['tr', 'yeteneklerin neler', 'skills'],
  ['tr', 'hangi teknolojileri biliyorsun', 'skills'],
  ['en', 'skills', 'skills'],
  ['en', 'tech stack?', 'skills'],
  ['tr', 'yapay zeka deneyimin', 'ai'],
  ['tr', 'LLM deneyimin var mı', 'ai'],
  ['en', 'AI experience', 'ai'],
  ['tr', 'RAG biliyor musun', 'ai'],
  ['tr', 'mobil geliştirme', 'mobile'],
  ['en', 'react native experience', 'mobile'],

  // ─── Projeler ──────────────────────────────────────────
  ['tr', 'projelerin neler', 'projects'],
  ['tr', 'projeler', 'projects'],
  ['en', 'projects', 'projects'],
  ['en', 'what have you built', 'projects'],
  ['tr', 'merhaba, projelerin neler?', 'projects'],
  ['tr', 'WeatherApp', 'detail', 'weatherapp'],
  ['tr', 'weatherapp nedir', 'detail', 'weatherapp'],
  ['tr', 'hava uygulaması', 'detail', 'weatherapp'],
  ['tr', 'wetherapp', 'detail', 'weatherapp'],
  ['en', 'tell me about weatherapp', 'detail', 'weatherapp'],
  ['tr', 'meme file', 'detail', 'memefile'],
  ['tr', 'Meme File nedir', 'detail', 'memefile'],
  ['tr', 'memefile', 'detail', 'memefile'],
  ['tr', 'bu siteyi nasıl yaptın', 'approach', 'portfolio'],
  ['tr', 'portfolio', 'detail', 'portfolio'],
  ['en', 'how was this site built', 'approach', 'portfolio'],

  // Varlık + niyet
  ['tr', "WeatherApp'in github linki", 'link', 'weatherapp'],
  ['tr', 'weatherapp repo', 'link', 'weatherapp'],
  ['en', 'meme file source code', 'link', 'memefile'],
  ['tr', "Meme File'ı nereden indirebilirim", 'download', 'memefile'],
  ['en', 'download meme file', 'download', 'memefile'],
  ['tr', "WeatherApp'te hangi teknolojiler var", 'tech', 'weatherapp'],
  ['tr', 'meme file ne ile yazıldı', 'tech', 'memefile'],
  ['en', 'what tech is behind weatherapp', 'tech', 'weatherapp'],
  ['tr', 'WeatherApp nasıl çalışıyor', 'approach', 'weatherapp'],
  ['en', 'how does meme file work', 'approach', 'memefile'],
  ['tr', 'weatherapp sonuçları', 'result', 'weatherapp'],
  ['tr', 'meme file performansı', 'result', 'memefile'],
  ['en', 'weatherapp results', 'result', 'weatherapp'],
  ['tr', 'weatherapp hangi problemi çözüyor', 'problem', 'weatherapp'],
  ['en', 'what problem does meme file solve', 'problem', 'memefile'],

  // ─── Deneyim ───────────────────────────────────────────
  ['tr', 'deneyimlerin', 'experience'],
  ['tr', 'nerede çalıştın', 'experience'],
  ['en', 'work experience', 'experience'],
  ['en', 'where did he work', 'experience'],
  ['tr', 'Unimall', 'detail', 'unimall'],
  ['tr', "unimall'da ne yaptın", 'detail', 'unimall'],
  ['tr', 'e-ticaret otomasyonu', 'detail', 'unimall'],
  ['tr', 'unimall sonuçları', 'result', 'unimall'],
  ['tr', "unimall'da ne kullandın", 'tech', 'unimall'],
  ['en', 'unimall results', 'result', 'unimall'],
  ['tr', 'Envagro', 'detail', 'envagro'],
  ['tr', 'envagroda nasıl çalıştın', 'approach', 'envagro'],
  ['en', 'envagro outcome', 'result', 'envagro'],
  ['tr', 'Appisode', 'detail', 'appisode'],
  ['tr', 'ege üniversitesi', 'detail', 'ege'],
  ['tr', 'patika bootcamp', 'detail', 'patika'],

  // ─── İşe alım ──────────────────────────────────────────
  ['tr', 'müsait misin', 'availability'],
  ['tr', 'şu an çalışıyor musun', 'availability'],
  ['tr', 'iş arıyor musun', 'availability'],
  ['tr', 'remote çalışır mısın', 'availability'],
  ['tr', 'maaş beklentin', 'availability'],
  ['en', 'what is your availability', 'availability'],
  ['en', 'are you open to work', 'availability'],
  ['en', 'are you currently working', 'availability'],
  ['tr', 'neden seni işe alalım', 'hire'],
  ['en', 'why should we hire you', 'hire'],
  ['tr', 'güçlü yönlerin', 'hire'],
  ['tr', 'en zor problemin', 'hardest'],
  ['en', 'hardest challenge', 'hardest'],
  ['tr', 'cv', 'cv'],
  ['tr', 'özgeçmişini indir', 'cv'],
  ['en', 'resume', 'cv'],
  ['tr', 'iletişim', 'contact'],
  ['tr', 'nasıl ulaşırım', 'contact'],
  ['tr', 'mail adresin', 'contact'],
  ['en', 'how can I contact him', 'contact'],
  ['en', 'linkedin', 'contact'],

  // ─── Eski botun yanlış cevapladıkları ──────────────────
  // "github" proje listesine düşüyordu
  ['tr', 'github linki', 'link'],
  ['en', 'github?', 'link'],
  // İngilizce müsaitlik anlaşılmıyordu
  ['en', 'availability', 'availability'],

  // ─── İlk ölçüm turunun görülmemiş ifadeleri ───────────
  // Bunlar önce ayarlanmadan çalıştırıldı (44'te 28); kaçanlardan genel
  // kurallar çıkarıldı: kısa kelimelere Türkçe ek, yazım hatası
  // eşleşmesinin tek başına yetmemesi, teknoloji adları sözlüğü.
  ['tr', 'iyi günler, onur hakkında bilgi alabilir miyim', 'about'],
  ['tr', 'Selamlar! Neler yapıyorsun bu aralar?', 'profession'],
  ['tr', 'hangi şehirdesin', 'location'],
  ['tr', 'uzaktan çalışmaya açık mısın?', 'availability'],
  ['tr', 'şu an bir işte misin', 'availability'],
  ['tr', 'ne zaman başlayabilirsin', 'availability'],
  ['tr', 'linkedin hesabın', 'contact'],
  ['tr', 'sana nasıl mail atarım', 'contact'],
  ['tr', 'özgeçmiş', 'cv'],
  ['tr', 'cvni görebilir miyim', 'cv'],
  ['tr', 'hava durumu uygulamandan bahset', 'detail', 'weatherapp'],
  ['tr', 'meme file kodları nerede', 'link', 'memefile'],
  ['tr', 'weatherappte hangi model var', 'tech', 'weatherapp'],
  ['tr', 'meme file windows için mi', 'detail', 'memefile'],
  ['tr', 'portfolyonun kaynak kodu', 'link', 'portfolio'],
  ['tr', 'unimallda neler başardın', 'result', 'unimall'],
  ['tr', 'envagroda ne iş yaptın', 'detail', 'envagro'],
  ['tr', 'appisodeda ne yaptın', 'detail', 'appisode'],
  ['tr', 'hangi programlama dillerini biliyorsun', 'skills'],
  ['tr', 'python biliyor musun', 'skills'],
  ['tr', 'en büyük başarın ne', 'hire'],
  ['tr', 'seni neden seçmeliyiz', 'hire'],
  ['tr', 'biyoloji okumuşsun neden yazılım', 'biology'],
  ['tr', 'hangi okuldan mezunsun', 'education'],
  ['tr', 'yapay zekayla ne yaptın', 'ai'],
  ['tr', 'bu bot nasıl çalışıyor', 'whynollm'],
  ['tr', 'gpt kullanıyor musun', 'whynollm'],
  ['tr', 'kaç yıllık deneyimin var', 'experience'],
  ['tr', 'fiyatın ne kadar', 'availability'],
  ['tr', 'hava nasıl bugün', 'detail', 'weatherapp'],
  ['en', 'good morning! who are you?', 'identity'],
  ['en', 'where can I find his github', 'link'],
  ['en', 'show me the weatherapp repo', 'link', 'weatherapp'],
  ['en', 'is meme file free to download', 'download', 'memefile'],
  ['en', 'what did he achieve at unimall', 'result', 'unimall'],
  ['en', 'which languages does he know', 'skills'],
  ['en', 'does he do freelance', 'availability'],
  ['en', 'can he relocate', 'availability'],
  ['en', 'what is his background', 'about'],
  ['en', 'is this chatbot using gpt', 'whynollm'],
  ['en', 'how do I reach out', 'contact'],
  ['en', 'his strongest skill', 'skills'],
  ['en', 'what was the hardest bug', 'hardest'],
  ['en', 'tell me something fun about him', 'hobby'],

  // ─── İkinci ölçüm turunun görülmemiş ifadeleri ────────
  // Ayarlanmadan önce 40'ta 33. Kaçanlar kelime/kalıp eksikleriydi.
  ['tr', 'Merhabalar, bir şirket için yazılımcı arıyoruz. Onur müsait mi acaba?', 'availability'],
  ['tr', 'İZMİR DIŞINA TAŞINABİLİR Mİ', 'availability'],
  ['tr', 'hangi projede yapay zeka kullandın', 'ai'],
  ['tr', 'weather app ne işe yarıyor 🤔', 'problem', 'weatherapp'],
  ['tr', 'meme fileın githubu', 'link', 'memefile'],
  ['tr', 'bu portfolyoyu ne ile yaptın', 'tech', 'portfolio'],
  ['tr', 'kaç projen var', 'projects'],
  ['tr', 'en sevdiğin proje hangisi', 'projects'],
  ['tr', 'iletişim bilgilerini alabilir miyim', 'contact'],
  ['tr', 'telefon numaran var mı', 'contact'],
  ['tr', 'React biliyor musun', 'skills'],
  ['tr', 'docker kullanıyor musun', 'skills'],
  ['tr', 'unimall projesinde neler yaptın', 'detail', 'unimall'],
  ['tr', 'envagro nedir', 'detail', 'envagro'],
  ['tr', 'ne kadar süre çalıştın appisodeda', 'detail', 'appisode'],
  ['tr', 'üniversiteyi bitirdin mi', 'education'],
  ['tr', 'not ortalaman kaç', 'education'],
  ['tr', 'kahve sever misin ☕', 'hobby'],
  ['tr', 'bot bilerek mi kural tabanlı', 'whynollm'],
  ['tr', 'merhaba nasılsın iyi misin', 'howareyou'],
  ['tr', 'sağ ol kanka', 'thanks'],
  ['tr', 'cv indirmek istiyorum', 'cv'],
  ['tr', 'neden yazılımcı oldun', 'biology'],
  ['en', 'Hi! Is Onur looking for a new job?', 'availability'],
  ['en', 'what stack did you use for meme file', 'tech', 'memefile'],
  ['en', 'link to weatherapp pls', 'link', 'weatherapp'],
  ['en', 'whats the result of the weatherapp evaluation', 'result', 'weatherapp'],
  ['en', 'how many projects does he have', 'projects'],
  ['en', 'does he know docker', 'skills'],
  ['en', 'where did he study', 'education'],
  ['en', 'can I see his CV?', 'cv'],
  ['en', 'email address?', 'contact'],
  ['en', 'what does onur do for a living', 'profession'],
  ['en', 'is this bot powered by chatgpt', 'whynollm'],
  ['en', 'tell me about envagro', 'detail', 'envagro'],
  ['en', 'what problem did unimall have', 'problem', 'unimall'],
  ['en', 'which city does he live in', 'location'],
  ['en', 'cool, thanks!', 'thanks'],
  ['en', 'qwerty zxcv', 'fallback'],
  ['tr', 'bugün maç var mı', 'fallback'],

  // ─── Uydurmamalı ───────────────────────────────────────
  ['tr', 'asdfgh', 'fallback'],
  ['tr', 'pizza tarifi verir misin', 'fallback'],
  ['en', 'what is the capital of france', 'fallback'],
  ['tr', 'Jarvis', 'fallback'],
];

function run(lang: 'tr' | 'en', message: string, context: ConversationContext = emptyContext) {
  return findBestMatch(message, lang, context);
}

test('altın test seti: tek mesajlık sorular', () => {
  const failures: string[] = [];
  for (const [lang, message, intent, entity] of SINGLE) {
    const result = run(lang, message);
    const got = `${result.intent}${result.entity ? `/${result.entity}` : ''}`;
    // "github linki" bağlamsız: proje reposu değil, sosyal hesaplar
    const expected = intent === 'link' && !entity ? 'socials' : `${intent}${entity ? `/${entity}` : ''}`;
    if (got !== expected) failures.push(`[${lang}] "${message}" → ${got} (beklenen ${expected})`);
  }
  const passed = SINGLE.length - failures.length;
  console.log(`  tek mesaj: ${passed}/${SINGLE.length} doğru`);
  assert.deepEqual(failures, []);
});

// ─── Çok adımlı konuşmalar: bağlam ──────────────────────────

type Turn = [message: string, intent: string, entity?: string];
const CONVERSATIONS: Array<{ name: string; lang: 'tr' | 'en'; turns: Turn[] }> = [
  {
    name: 'zamirle takip: "onun linki"',
    lang: 'tr',
    turns: [
      ['WeatherApp nedir', 'detail', 'weatherapp'],
      ['github linki?', 'link', 'weatherapp'],
      ['hangi teknolojiler', 'tech', 'weatherapp'],
    ],
  },
  {
    name: 'aynı soruyu yeni projeye uygulama: "peki Meme File?"',
    lang: 'tr',
    turns: [
      ["WeatherApp'in teknolojileri", 'tech', 'weatherapp'],
      ['peki meme file?', 'tech', 'memefile'],
      ['ya portfolio', 'tech', 'portfolio'],
    ],
  },
  {
    name: 'İngilizce takip',
    lang: 'en',
    turns: [
      ['tell me about meme file', 'detail', 'memefile'],
      ['what about its results?', 'result', 'memefile'],
      ['and weatherapp?', 'result', 'weatherapp'],
    ],
  },
  {
    name: 'genel bir sorudan sonra "github" proje değil hesap',
    lang: 'tr',
    turns: [
      ['WeatherApp', 'detail', 'weatherapp'],
      ['iletişim', 'contact'],
      ['github linki', 'socials'],
    ],
  },
  {
    name: 'teşekkür konuyu unutturmaz',
    lang: 'tr',
    turns: [
      ['unimall', 'detail', 'unimall'],
      ['teşekkürler', 'thanks'],
      ['sonuçları ne oldu', 'result', 'unimall'],
    ],
  },
  {
    name: 'işe alım yolu',
    lang: 'en',
    turns: [
      ['hi', 'greet'],
      ['are you available?', 'availability'],
      ['why should we hire him', 'hire'],
      ['resume', 'cv'],
    ],
  },
];

test('altın test seti: bağlamlı konuşmalar', () => {
  const failures: string[] = [];
  let total = 0;
  for (const conversation of CONVERSATIONS) {
    let context = emptyContext;
    for (const [message, intent, entity] of conversation.turns) {
      total++;
      const result = run(conversation.lang, message, context);
      context = result.context;
      const got = `${result.intent}${result.entity ? `/${result.entity}` : ''}`;
      const expected = `${intent}${entity ? `/${entity}` : ''}`;
      if (got !== expected) failures.push(`${conversation.name}: "${message}" → ${got} (beklenen ${expected})`);
    }
  }
  console.log(`  konuşma adımı: ${total - failures.length}/${total} doğru`);
  assert.deepEqual(failures, []);
});

test('cevaplar sitenin verisiyle çelişmiyor', () => {
  // Hero "yeni fırsatlara açık" diyor; bot "şu an çalışıyor" dememeli
  for (const message of ['şu an çalışıyor musun', 'ne iş yapıyorsun']) {
    const response = run('tr', message).response.toLocaleLowerCase('tr');
    assert.ok(response.includes('yeni fırsatlara açık'), `"${message}" müsaitliği söylemiyor`);
    assert.ok(!response.includes('şu anda çalışıyor'), `"${message}" hâlâ "şu anda çalışıyor" diyor`);
  }
  // Siteden kaldırılan projeler hiçbir cevapta geçmemeli
  for (const message of ['projelerin neler', 'mobil geliştirme', 'yapay zeka', 'yardım']) {
    const response = run('tr', message).response;
    for (const removed of ['Jarvis', 'ChatApp', 'MovieApp']) {
      assert.ok(!response.includes(removed), `"${message}" cevabında ${removed} geçiyor`);
    }
  }
  // Proje linki o projenin reposu olmalı, profil değil
  assert.match(run('tr', "Meme File'ın github linki").response, /github\.com\/Enver-Onur-Cogalan\/meme-file/);
});
