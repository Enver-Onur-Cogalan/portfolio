'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Language = 'tr' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Çeviri Sözlüğü ─────────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
  tr: {
    // Nav
    'nav.about': 'Hakkımda',
    'nav.projects': 'Projeler',
    'nav.experience': 'Deneyimler',
    'nav.contact': 'İletişim',

    // Hero
    'hero.welcome': 'Hoş Geldiniz',
    'hero.scroll': 'Keşfetmek için aşağı kaydır',
    'hero.subtitle': 'Mobile Developer & AI Researcher',

    // About
    'about.title': 'Hakkımda',
    'about.techTitle': 'Teknik Yetenekler',
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
    'about.bio': 'Biyoloji disipliniyle yetişmiş, yazılıma gönül vermiş bir geliştiriciyim. React Native ile akıcı ve samimi kullanıcı deneyimleri tasarlarken, AI Researcher heyecanımla yapay zekayı projelerime değer katan bir yol arkadaşı olarak dahil ediyorum. Karmaşık problemleri basit çözümlere dönüştürmeyi, öğrenmeyi ve paylaşmayı seviyorum. Veriyi kullanıcı dostu hikayelere dönüştürmek için kod yazıyorum.',

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
    'experience.current.subtitle': 'Mobile Developer & AI Researcher',
    'experience.current.desc': 'Konuşmayı Metne (STT), Metni Sese (TTS) ve Büyük Dil Modelleri (LLM) üzerine detaylı saha ve literatür araştırmaları yapmak. Farklı açık kaynak ve ticari AI modellerini karşılaştırmak, benchmark çalışmaları yürütmek.',
    'exp.period.2020-2024': '2020 - 2024',
    'exp.period.2025': '2025',
    'exp.period.aug-sep-2025': 'Ağustos 2025 - Eylül 2025',
    'exp.period.dec-present': 'Aralık 2025 - Devam Ediyor',

    // Contact
    'contact.title': 'İletişim',
    'contact.desc': 'Beni aşağıdaki kanallardan takip edebilir veya e-posta göndererek iletişime geçebilirsiniz.',
    'contact.footer': 'Tüm hakları saklıdır.',

    // Music
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
    'chat.confirm': 'Onayla',
    'chat.skip': 'Geç',
  },
  en: {
    // Nav
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.contact': 'Contact',

    // Hero
    'hero.welcome': 'Welcome',
    'hero.scroll': 'Scroll down to explore',
    'hero.subtitle': 'Mobile Developer & AI Researcher',

    // About
    'about.title': 'About Me',
    'about.techTitle': 'Technical Skills',
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
    'about.bio': 'A developer raised with a biology discipline who fell in love with software. While designing fluid and authentic user experiences with React Native, I integrate AI as a value-adding companion in my projects with my passion as an AI Researcher. I love transforming complex problems into simple solutions, learning, and sharing. I write code to turn data into user-friendly stories.',

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
    'experience.current.subtitle': 'Mobile Developer & AI Researcher',
    'experience.current.desc': 'Conducting detailed field and literature research on Speech-to-Text (STT), Text-to-Speech (TTS) and Large Language Models (LLM). Comparing various open-source and commercial AI models, running benchmark studies.',
    'exp.period.2020-2024': '2020 - 2024',
    'exp.period.2025': '2025',
    'exp.period.aug-sep-2025': 'August 2025 - September 2025',
    'exp.period.dec-present': 'December 2025 - Present',

    // Contact
    'contact.title': 'Contact',
    'contact.desc': 'Follow me on the channels below or get in touch by sending an email.',
    'contact.footer': 'All rights reserved.',

    // Music
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
    'chat.confirm': 'Confirm',
    'chat.skip': 'Skip',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('tr');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Language | null;
    if (stored && (stored === 'tr' || stored === 'en')) {
      setLangState(stored);
    } else {
      // Tarayıcı diline göre otomatik algıla
      const browserLang = navigator.language.toLowerCase();
      const detectedLang: Language = browserLang.startsWith('tr') ? 'tr' : 'en';
      setLangState(detectedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    // HTML lang attribute güncelle
    document.documentElement.lang = newLang;
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
