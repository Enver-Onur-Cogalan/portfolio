// Çeviri sözlüğü — hem istemci (LanguageContext) hem sunucu (chatbot
// yanıtları) buradan okur. Tek kaynak olması, aynı metnin veri dosyası,
// context ve bot yanıtlarında üç kez yazılmasını önlüyor.

export type Language = 'tr' | 'en';

// ─── Çeviri Sözlüğü ─────────────────────────────────────────
export const translations: Record<Language, Record<string, string>> = {
  tr: {
    // Nav
    'nav.about': 'Hakkımda',
    'nav.projects': 'Projeler',
    'nav.experience': 'Deneyimler',
    'nav.contact': 'İletişim',
    'nav.resume': 'CV',
    'resume.title': 'CV',
    'resume.desc': 'Klasöre tıkla, içinden iki şey çıksın: indirilebilir bir kopya ve siteden çıkmadan bakabileceğin bir önizleme.',
    'resume.folderLabel': 'CV',
    'resume.folderOpen': 'CV klasörünü aç',
    'resume.folderClose': 'CV klasörünü kapat',
    'resume.download': 'İndir',
    'resume.preview': 'Önizleme',
    'resume.close': 'Önizlemeyi kapat',
    'resume.openNewTab': 'Yeni sekmede aç',
    'nav.menu': 'Menü',
    'nav.closeMenu': 'Menüyü kapat',

    // Hero
    'hero.welcome': 'Hoş Geldiniz',
    'hero.scroll': 'Keşfetmek için aşağı kaydır',
    'hero.subtitle': 'AI Engineer & Mobile Developer',

    // About
    'about.title': 'Hakkımda',
    'about.techTitle': 'Teknik Yetenekler',
    'about.techSubtitle': 'Projelerde ve sahada fiilen kullandığım araçlar.',
    'skills.category.ai': 'AI & Dil Modelleri',
    'skills.category.mobile': 'Mobil',
    'skills.category.web': 'Web & Arayüz',
    'skills.category.backend': 'Backend & Veri',
    'skills.category.infra': 'Altyapı & Araçlar',
    'about.stat.experience': 'Yıllık Deneyim',
    'about.stat.projects': 'Proje',
    'about.stat.coffee': 'İçilen Kahve',
    // Principles
    'about.principle1.title': 'Karmaşıklığı Sadeleştirmek',
    'about.principle1.quote': 'Karmaşıklığı sadeleştirmek bir tercih değil, bir sanat biçimidir.',
    'about.principle2.title': 'En İyi Kod',
    'about.principle2.quote': 'En iyi kod, yazılmasına gerek kalmayan koddur.',
    'about.principle3.title': 'Biyolojik Düzen',
    'about.principle3.quote': 'Hücrelerin mükemmel düzenini, yazdığım her satıra taşımayı hedefliyorum.',
    // Bio
    'about.bio': 'Selam, ben Onur.\n\nBiyoloji okudum ama laboratuvarda değil, kodun içinde buldum kendimi. Şimdi yapay zekâ tabanlı sistemler kuruyorum: kendi başına iş yapan ajanlar, belgeleri okuyup anlamlandıran pipeline\'lar, konuşan ve dinleyen arayüzler.\n\nSon projemde 22 milyon ürün kaydı olan bir e-ticaret sistemini otomatikleştirdik; ilan açmaktan müşteri desteğine kadar manuel yürüyen ne varsa devraldı. Maliyet %40 düştü. Öncesinde konuşma ve dil modellerini karşılaştıran benchmark çalışmaları yaptım — hangi modelin bizim işimize yaradığını tahmin etmek yerine ölçtük.\n\nMobil tarafından geliyorum, o yüzden \'çalışıyor\' ile \'kullanılabilir\' arasındaki farkı önemsiyorum. İyi çalışan ama kimsenin kullanmadığı bir sistem benim için bitmiş sayılmaz.\n\nYeni bir şey öğrenmek en sevdiğim kısım. Muhtemelen bu yüzden buradayım.',
    // Sohbet botu için kısa sürüm — balon içinde beş paragraf uzun kaçıyor
    'about.bioShort': 'Selam, ben Onur. Biyoloji okudum ama kendimi kodun içinde buldum. Şimdi yapay zekâ tabanlı sistemler kuruyorum: kendi başına iş yapan ajanlar, belgeleri okuyup anlamlandıran pipeline\'lar, konuşan ve dinleyen arayüzler. Mobil tarafından geldiğim için \'çalışıyor\' ile \'kullanılabilir\' arasındaki farkı önemsiyorum.',

    // Projects
    'projects.title': 'Projeler',
    'projects.portfolio.desc': 'Modern animasyonlar ve interaktif sohbet botu ile kişisel portfolyo websitesi. Hakkımda, projeler, deneyimler ve iletişim bölümlerini içeren Next.js uygulaması.',
    'projects.jarvis.desc': 'Jarvis Assistant, günlük işlerinizi kolaylaştırmak ve sesli komutlarla mobil cihazınızla etkileşim kurmanıza olanak sağlamak üzere tasarlanmış akıllı bir kişisel asistandır.',
    'projects.chatapp.desc': 'ChatApp, React Native CLI ve Socket.IO ile geliştirilmiş, gerçek zamanlı bire bir ve grup sohbet uygulamasıdır.',
    'projects.movieapp.desc': 'React Native ile geliştirilmiş film izleme uygulaması.',

    // Experience
    'experience.title': 'Deneyimler',
    'experience.ege.subtitle': 'Biyoloji Bölümü',
    'experience.ege.desc': 'Not ortalaması: 3.05/4',
    'experience.patika.subtitle': 'Bootcamp',
    'experience.patika.desc': 'Seçkin ve yoğun içerikli bir yazılım bootcamp\'ini başarıyla tamamladım. React Native, JavaScript ve Git teknolojilerine odaklanarak, gerçek dünya problemlerine çözüm sağlayan mobil uygulama projeleri geliştirdim.',
    'experience.appisode.subtitle': 'Freelance React Native FullStack Developer',
    'experience.appisode.desc': 'London, UK (Remote). React Native tabanlı Expo framework\'ü kullanarak mobil uygulama geliştirme üzerinde çalıştım. Yeni özellikler geliştirdim, UI/UX iyileştirmeleri ve performans optimizasyonları yaptım.',
    'experience.envagro.subtitle': 'AI Researcher',
    'experience.envagro.headline': 'Konuşma ve Dil Modellerinin Ürüne Dönüşümü',
    'experience.envagro.desc': 'Konuşmaya dayalı yapay zekâ özellikleri için model seçimini sezgiden çıkarıp ölçüme dayandırdım. STT, TTS ve LLM modellerini aynı koşullarda benchmark edip seçilenleri ölçeklenebilir API\'lerle prototipten canlı ürüne taşıdım.',
    'experience.envagro.context': 'Envagro\'da konuşmaya dayalı yapay zekâ özellikleri geliştirilecekti. Piyasada onlarca STT, TTS ve LLM seçeneği var; hangisinin bu ürün için doğru olduğu ise fiyat, gecikme, doğruluk ve dil desteği arasında bir denge meselesiydi. Bu kararın sezgiyle değil ölçümle verilmesi gerekiyordu.',
    'experience.envagro.approach': 'İşe literatür ve saha araştırmasıyla başladım; mevcut açık kaynak ve ticari modelleri kapsamlı biçimde taradım. Ardından bu modelleri aynı koşullarda karşılaştıran benchmark çalışmaları tasarladım — böylece model seçimi öznel bir tercih olmaktan çıkıp ölçülebilir bir karara dönüştü. Seçilen modelleri ürüne taşımak için ölçeklenebilir ve güvenilir API\'ler tasarladım, entegrasyon sürecini prototipten canlı ortama kadar kendim yürüttüm. Süreç boyunca ürün, yazılım ve tasarım ekipleriyle yakın çalıştım; çünkü bir araştırma bulgusu ancak kullanıcının elinde bir özelliğe dönüştüğünde değer üretiyor.',
    'experience.envagro.result': 'Model seçim kararları ölçüme dayalı hale geldi. Araştırma çıktıları prototipte kalmayıp canlı ürüne taşındı ve model doğruluğu ile kullanıcı deneyimi odağında sürekli iyileştirilen bir yapıya kavuştu.',

    // Unimall — vaka çalışması
    'experience.unimall.subtitle': 'AI Engineer',
    'experience.unimall.headline': '22 Milyon Kayıtlık E-ticaret Operasyonunun Otomasyonu',
    'experience.unimall.desc': 'Üç satış kanalına yayılmış 22 milyondan fazla ürün kaydının yönetildiği e-ticaret operasyonunu uçtan uca otomatikleştirdim.',
    'experience.unimall.problem': 'Unimall, üç ayrı satış kanalında 22 milyonu aşan ürün kaydını yönetiyordu. İlan açma, ürün verisi girişi ve müşteri desteği büyük ölçüde manuel yürüdüğü için hem maliyetliydi hem de ölçeklenmiyordu.',
    'experience.unimall.approach': 'Süreci üç katmanda ele aldım: veri senkronizasyonu, içerik üretimi ve müşteri iletişimi. Veri katmanında cronjob ve webhook tabanlı bir mimari kurarak kanallar arası senkronizasyonu otomatikleştirdim. İçerik tarafında, ürün özelliklerini okuyup uygun ilan metnini kendi üreten bir AI agent tasarladım. Veri girişindeki manuel yükü kaldırmak için OCR teknolojilerini pipeline\'a entegre ettim. Müşteri destek tarafında ise sık gelen talepleri uçtan uca çözebilen agentic bir chatbot geliştirdim. Son olarak, üç ayrı panelde dağılmış operasyonu tek bir arayüzde topladım.',
    'experience.unimall.result': 'OCR entegrasyonu tek başına operasyonel maliyette %40 tasarruf getirdi. İlan açma süreci manuel olmaktan çıkıp otomatik hale geldi, destek ekibinin yükü azaldı ve üç kanal tek bir kontrol noktasından yönetilebilir oldu.',
    'experience.unimall.metric.records': 'Ürün kaydı',
    'experience.unimall.metric.cost': 'Maliyet tasarrufu',
    'experience.unimall.metric.panels': 'Panel birleştirildi',

    // Deneyim — genel etiketler
    'experience.block.context': 'Bağlam',
    'experience.block.problem': 'Problem',
    'experience.block.approach': 'Yaklaşım',
    'experience.block.result': 'Sonuç',
    'experience.expand': 'Detayları gör',
    'experience.collapse': 'Detayları gizle',

    'exp.period.2020-2024': '2020 - 2024',
    'exp.period.2025': '2025',
    'exp.period.aug-sep-2025': 'Ağustos 2025 - Eylül 2025',
    'exp.period.dec2025-jun2026': 'Aralık 2025 - Haziran 2026',
    'exp.period.jun-aug-2026': 'Haziran 2026 - Ağustos 2026',

    // Contact
    'contact.title': 'İletişim',
    'contact.desc': 'Beni aşağıdaki kanallardan takip edebilir veya e-posta göndererek iletişime geçebilirsiniz.',
    'contact.footer': 'Tüm hakları saklıdır.',

    // Music
    'music.toggle': 'Müzik çaları aç',
    'music.info': 'Bu şarkı Enver Onur Çoğalan tarafından Suno AI ile oluşturuldu.',
    'music.lyrics.placeholder': '♪ Müzik başladığında sözler burada gözükecek ♪',
    'music.back10': '10 saniye geri',
    'music.forward10': '10 saniye ileri',

    // Social
    'social.email': 'E-posta',

    // Chatbot
    'chat.open': 'Sohbeti aç',
    'chat.greeting': 'Merhaba! Ben Onur\'un portfolyo chatbotuyum. Sana daha yakından hitap edebilmem için ismini öğrenebilir miyim?',
    'chat.namePlaceholder': 'İsminizi yazın...',
    'chat.nameFromAbove': 'Yukarıdan ismini gir...',
    'chat.messagePlaceholder': 'Mesajınızı yazın...',
    'chat.learningName': 'İsmini öğreniyorum...',
    'chat.howCanIHelp': 'Sana nasıl yardımcı olabilirim?',
    'chat.chattingWith': 'ile sohbet',
    'chat.nameSuccess': 'Mükemmel, {name}! Artık seni daha yakından tanıyorum. Sana nasıl yardımcı olabilirim {name}?',
    'chat.nameRetry': 'Neden ismini girmedin ki? Sadece seninle daha yakından konuşmak istiyordum. Bir şans daha veriyorum...',
    'chat.nameSkip': 'Peki, sıkıntı yok! İsmin olmadan da sana yardımcı olabilirim. Sana nasıl yardımcı olabilirim?',
    'chat.error': 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
    'chat.profanity': 'Hata 403: Terbiye bulunamadı. Lütfen lügatini güncelleyip tekrar dene.',
    'chat.rateLimited': 'Biraz hızlı gidiyoruz! Birkaç saniye sonra tekrar dener misin?',
    'chat.tooLong': 'Mesajın biraz uzun kaçtı. 500 karakteri geçmeyecek şekilde tekrar yazar mısın?',
    'chat.goToSection': 'İlgili bölüme git',
    'chat.reset': 'Sohbeti yeniden başlat',
    'chat.pathQuestion': 'Peki seni buraya getiren ne? Doğru yerden başlayalım.',
    'chat.path.hiring': 'İşe alım için bakıyorum',
    'chat.path.technical': 'Teknik tarafı merak ediyorum',
    'chat.path.browsing': 'Sadece geziniyorum',
    'chat.path.hiring.intro': 'Anlaşıldı. Değerlendirme yaparken en çok işine yarayacak başlıklar bunlar — deneyimleri, neden Onur sorusunun cevabı ve iletişim.',
    'chat.path.technical.intro': 'Süper. O zaman işin mutfağına bakalım: vaka çalışmaları, AI tarafı ve kullandığı araçlar.',
    'chat.path.browsing.intro': 'Keyfine bak! Nereden başlamak istersen — hikâyesi, projeleri ya da boş zamanlarında ne yaptığı.',
    'chat.suggestionsTitle': 'Şunları sorabilirsin',
    'chat.confirm': 'Onayla',
    'chat.skip': 'Geç',
  },
  en: {
    // Nav
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.contact': 'Contact',
    'nav.resume': 'Resume',
    'resume.title': 'Resume',
    'resume.desc': 'Click the folder and two things come out: a copy you can download, and a preview you can read without leaving the site.',
    'resume.folderLabel': 'CV',
    'resume.folderOpen': 'Open resume folder',
    'resume.folderClose': 'Close resume folder',
    'resume.download': 'Download',
    'resume.preview': 'Preview',
    'resume.close': 'Close preview',
    'resume.openNewTab': 'Open in new tab',
    'nav.menu': 'Menu',
    'nav.closeMenu': 'Close menu',

    // Hero
    'hero.welcome': 'Welcome',
    'hero.scroll': 'Scroll down to explore',
    'hero.subtitle': 'AI Engineer & Mobile Developer',

    // About
    'about.title': 'About Me',
    'about.techTitle': 'Technical Skills',
    'about.techSubtitle': 'Tools I actually use in projects and in the field.',
    'skills.category.ai': 'AI & Language Models',
    'skills.category.mobile': 'Mobile',
    'skills.category.web': 'Web & Interface',
    'skills.category.backend': 'Backend & Data',
    'skills.category.infra': 'Infrastructure & Tools',
    'about.stat.experience': 'Years Experience',
    'about.stat.projects': 'Projects',
    'about.stat.coffee': 'Cups of Coffee',
    // Principles
    'about.principle1.title': 'Simplify Complexity',
    'about.principle1.quote': 'Simplifying complexity is not a choice, it\'s an art form.',
    'about.principle2.title': 'The Best Code',
    'about.principle2.quote': 'The best code is the code that never needs to be written.',
    'about.principle3.title': 'Biological Order',
    'about.principle3.quote': 'I aim to bring the perfect order of cells into every line I write.',
    // Bio
    'about.bio': 'Hi, I\'m Onur.\n\nI studied biology, but I found myself in code rather than in the lab. These days I build AI-based systems: agents that carry out work on their own, pipelines that read and make sense of documents, interfaces that speak and listen.\n\nOn my most recent project we automated an e-commerce system holding 22 million product records; it took over everything that ran manually, from creating listings to customer support. Costs dropped by 40%. Before that, I ran benchmark studies comparing speech and language models — instead of guessing which model suited our work, we measured it.\n\nI come from the mobile side, so I care about the difference between \'it works\' and \'it\'s usable\'. A system that runs well but nobody uses isn\'t finished as far as I\'m concerned.\n\nLearning something new is my favourite part. That\'s probably why I\'m here.',
    'about.bioShort': 'Hi, I\'m Onur. I studied biology but found myself in code. These days I build AI-based systems: agents that carry out work on their own, pipelines that read and make sense of documents, interfaces that speak and listen. Coming from the mobile side, I care about the difference between \'it works\' and \'it\'s usable\'.',

    // Projects
    'projects.title': 'Projects',
    'projects.portfolio.desc': 'Personal portfolio website with modern animations and interactive chat bot. A Next.js application featuring About, Projects, Experience and Contact sections.',
    'projects.jarvis.desc': 'Jarvis Assistant is a smart personal assistant designed to simplify daily tasks and enable voice-controlled interaction with your mobile device.',
    'projects.chatapp.desc': 'ChatApp is a real-time one-on-one and group chat application built with React Native CLI and Socket.IO.',
    'projects.movieapp.desc': 'A movie browsing application built with React Native.',

    // Experience
    'experience.title': 'Experience',
    'experience.ege.subtitle': 'Biology Department',
    'experience.ege.desc': 'GPA: 3.05/4',
    'experience.patika.subtitle': 'Bootcamp',
    'experience.patika.desc': 'Successfully completed an intensive software bootcamp. Developed mobile application projects solving real-world problems, focusing on React Native, JavaScript, and Git technologies.',
    'experience.appisode.subtitle': 'Freelance React Native FullStack Developer',
    'experience.appisode.desc': 'London, UK (Remote). Worked on mobile app development using React Native with Expo framework. Developed new features, UI/UX improvements, and performance optimizations.',
    'experience.envagro.subtitle': 'AI Researcher',
    'experience.envagro.headline': 'Turning Speech and Language Models into a Product',
    'experience.envagro.desc': 'Moved model selection for speech-based AI features from intuition to measurement. Benchmarked STT, TTS and LLM models under identical conditions and carried the selected ones from prototype to production through scalable APIs.',
    'experience.envagro.context': 'Envagro was set to build speech-based AI features. There are dozens of STT, TTS and LLM options on the market, and which one was right for this product came down to a balance between cost, latency, accuracy and language support. That decision had to be made by measurement, not intuition.',
    'experience.envagro.approach': 'I started with literature and field research, surveying the available open-source and commercial models comprehensively. I then designed benchmark studies comparing those models under identical conditions — turning model selection from a subjective preference into a measurable decision. To bring the selected models into the product, I designed scalable and reliable APIs and drove the integration myself, from prototype to production. Throughout, I worked closely with the product, engineering and design teams, because a research finding only creates value once it becomes a feature in the user\'s hands.',
    'experience.envagro.result': 'Model selection decisions became measurement-driven. Research output did not stay in prototypes but reached the live product, settling into a structure that is continuously improved around model accuracy and user experience.',

    // Unimall — case study
    'experience.unimall.subtitle': 'AI Engineer',
    'experience.unimall.headline': 'Automating an E-commerce Operation of 22 Million Records',
    'experience.unimall.desc': 'Automated an end-to-end e-commerce operation managing over 22 million product records across three sales channels.',
    'experience.unimall.problem': 'Unimall was managing over 22 million product records across three separate sales channels. Listing creation, product data entry and customer support ran largely manually, which made the operation both costly and impossible to scale.',
    'experience.unimall.approach': 'I addressed the process in three layers: data synchronization, content generation and customer communication. On the data layer, I built a cronjob and webhook based architecture to automate cross-channel synchronization. For content, I designed an AI agent that reads product attributes and writes the listing copy on its own. To remove the manual load in data entry, I integrated OCR technologies into the pipeline. On the customer support side, I developed an agentic chatbot able to resolve common requests end to end. Finally, I consolidated an operation spread across three separate panels into a single interface.',
    'experience.unimall.result': 'The OCR integration alone delivered a 40% saving in operational costs. Listing creation went from manual to fully automated, the support team\'s workload dropped, and all three channels became manageable from a single control point.',
    'experience.unimall.metric.records': 'Product records',
    'experience.unimall.metric.cost': 'Cost saving',
    'experience.unimall.metric.panels': 'Panels merged',

    // Experience — generic labels
    'experience.block.context': 'Context',
    'experience.block.problem': 'Problem',
    'experience.block.approach': 'Approach',
    'experience.block.result': 'Result',
    'experience.expand': 'View details',
    'experience.collapse': 'Hide details',

    'exp.period.2020-2024': '2020 - 2024',
    'exp.period.2025': '2025',
    'exp.period.aug-sep-2025': 'August 2025 - September 2025',
    'exp.period.dec2025-jun2026': 'December 2025 - June 2026',
    'exp.period.jun-aug-2026': 'June 2026 - August 2026',

    // Contact
    'contact.title': 'Contact',
    'contact.desc': 'Follow me on the channels below or get in touch by sending an email.',
    'contact.footer': 'All rights reserved.',

    // Music
    'music.toggle': 'Open music player',
    'music.info': 'This song was created by Enver Onur Çoğalan using Suno AI.',
    'music.lyrics.placeholder': '♪ Lyrics will appear here when music starts ♪',
    'music.back10': '10 seconds back',
    'music.forward10': '10 seconds forward',

    // Social
    'social.email': 'Email',

    // Chatbot
    'chat.open': 'Open chat',
    'chat.greeting': 'Hello! I\'m Onur\'s portfolio chatbot. Could you tell me your name so I can address you more personally?',
    'chat.namePlaceholder': 'Enter your name...',
    'chat.nameFromAbove': 'Enter your name above...',
    'chat.messagePlaceholder': 'Type your message...',
    'chat.learningName': 'Learning your name...',
    'chat.howCanIHelp': 'How can I help you?',
    'chat.chattingWith': 'chatting with',
    'chat.nameSuccess': 'Awesome, {name}! Now I know you better. How can I help you {name}?',
    'chat.nameRetry': 'Why didn\'t you enter your name? I just wanted to chat more personally. Giving you one more chance...',
    'chat.nameSkip': 'No worries! I can help you without a name. How can I help you?',
    'chat.error': 'Sorry, an error occurred. Please try again.',
    'chat.profanity': 'Error 403: No manners found. Please update your dictionary and try again.',
    'chat.rateLimited': 'That was quick! Give it a few seconds and try again.',
    'chat.tooLong': 'That message ran a bit long. Could you keep it under 500 characters?',
    'chat.goToSection': 'Go to section',
    'chat.reset': 'Restart chat',
    'chat.pathQuestion': 'So what brings you here? Let\'s start from the right place.',
    'chat.path.hiring': 'I\'m hiring',
    'chat.path.technical': 'I\'m curious about the tech',
    'chat.path.browsing': 'Just browsing',
    'chat.path.hiring.intro': 'Got it. These are the topics that help most when you\'re evaluating someone — his experience, the case for hiring him, and how to reach him.',
    'chat.path.technical.intro': 'Nice. Let\'s look under the hood then: case studies, the AI side, and the tools he actually uses.',
    'chat.path.browsing.intro': 'Enjoy! Start wherever you like — his story, his projects, or what he does in his free time.',
    'chat.suggestionsTitle': 'You can ask about',
    'chat.confirm': 'Confirm',
    'chat.skip': 'Skip',
  },
};

/** Sunucu tarafı için context'siz çeviri erişimi. */
export function translate(lang: Language, key: string): string {
  return translations[lang][key] ?? key;
}
