'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, MessageCircle, Bot, User, Check, SkipForward } from 'lucide-react';
import { quickReplies } from '@/lib/chat/responses';
import ChatMessage from './ChatMessage';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  showOptions: boolean;
  isNameRequest?: boolean;
  optionsUsed?: boolean; // quick reply'lar kullanıldı mı
}

type ChatState = 'initial' | 'waiting_for_name' | 'name_entered' | 'name_skipped';

const sectionIds: Record<string, string> = {
  '1': 'hakkimda',
  '2': 'hakkimda',
  '3': 'deneyimler',
  '4': 'projeler',
  '5': 'iletisim',
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('initial');
  const [userName, setUserName] = useState<string | null>(null);
  const [nameAttempt, setNameAttempt] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const { lang, t } = useLanguage();

  const isWaitingForName = chatState === 'waiting_for_name';

  // Initialize with greeting when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: t('chat.greeting'),
          timestamp: new Date(),
          showOptions: false,
          isNameRequest: true,
        },
      ]);
      setChatState('waiting_for_name');
    }
  }, [isOpen, messages.length]);

  // Focus name input when it appears
  useEffect(() => {
    if (isWaitingForName) {
      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [isWaitingForName, messages.length]);

  // Focus main input after name flow completes
  useEffect(() => {
    if (chatState === 'name_entered' || chatState === 'name_skipped') {
      setTimeout(() => mainInputRef.current?.focus(), 150);
    }
  }, [chatState]);

  // Yavaş ve akıcı scroll — GSAP animasyonları görünsün diye
  const smoothScrollTo = useCallback((targetY: number, duration = 2000) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, []);

  const scrollToSection = useCallback((optionId: string) => {
    const sectionId = sectionIds[optionId];
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        const targetY = element.getBoundingClientRect().top + window.scrollY;
        smoothScrollTo(targetY, 2500);
      }
    }
  }, [smoothScrollTo]);

  // Quick reply butonlarını kullanıldı olarak işaretle (tümü kaybolsun)
  const markOptionsUsed = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, optionsUsed: true } : msg
      )
    );
  }, []);

  const handleOptionClick = async (optionId: string, parentMessageId: string) => {
    const option = quickReplies.find((q) => q.id === optionId);
    if (!option) return;

    // Butonları hemen kaybet
    markOptionsUsed(parentMessageId);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: option.label[lang],
      timestamp: new Date(),
      showOptions: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: option.label[lang], lang }),
      });

      const data = await response.json();
      const typingDelay = data.typingDelay || 500;

      // Typing indicator göster, sonra mesajı ekle
      await new Promise((r) => setTimeout(r, typingDelay));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Bir hata oluştu.',
        timestamp: new Date(),
        showOptions: data.showOptions || false,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Auto scroll after delay if specified
      if (data.autoScrollDelay) {
        setTimeout(() => {
          scrollToSection(optionId);
        }, data.autoScrollDelay);
      } else {
        scrollToSection(optionId);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chat.error'),
        timestamp: new Date(),
        showOptions: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  const handleNameSubmit = () => {
    const trimmed = input.trim();

    if (trimmed) {
      setUserName(trimmed);
      setChatState('name_entered');
      setInput('');

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chat.nameSuccess').replace(/\{name\}/g, trimmed),
        timestamp: new Date(),
        showOptions: true,
      };

      setMessages((prev) => [...prev, responseMessage]);
    } else {
      if (nameAttempt === 0) {
        setNameAttempt(1);
        setInput('');

        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: t('chat.nameRetry'),
          timestamp: new Date(),
          showOptions: false,
          isNameRequest: true,
        };
        setMessages((prev) => [...prev, responseMessage]);
      } else {
        handleSkipName();
      }
    }
  };

  const handleSkipName = () => {
    setChatState('name_skipped');
    setInput('');

    const responseMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: t('chat.nameSkip'),
      timestamp: new Date(),
      showOptions: true,
    };
    setMessages((prev) => [...prev, responseMessage]);
  };

  // Serbest metin mesajından doğru section'a scroll etmek için yardımcı
  const findSectionFromResponse = (responseText: string): string | null => {
    const lower = responseText.toLowerCase();
    if (lower.includes('iletişim') || lower.includes('e-posta') || lower.includes('email')) return '5';
    if (lower.includes('proje') || lower.includes('jarvis') || lower.includes('chatapp')) return '4';
    if (lower.includes('deneyim') || lower.includes('kariyer') || lower.includes('bootcamp')) return '3';
    if (lower.includes('yetenek') || lower.includes('araç kutu') || lower.includes('stack')) return '2';
    if (lower.includes('hakkı') || lower.includes('biyoloji') || lower.includes('tanıt')) return '1';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If waiting for name, handle name submission
    if (isWaitingForName) {
      handleNameSubmit();
      return;
    }

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      showOptions: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, lang }),
      });

      const data = await response.json();
      const typingDelay = data.typingDelay || 500;

      // Typing indicator göster, sonra mesajı ekle
      await new Promise((r) => setTimeout(r, typingDelay));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        showOptions: data.showOptions || false,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Yanıt içeriğine göre doğru section'a scroll et
      if (data.autoScrollDelay) {
        const sectionId = findSectionFromResponse(data.response);
        if (sectionId) {
          setTimeout(() => {
            scrollToSection(sectionId);
          }, data.autoScrollDelay);
        }
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chat.error'),
        timestamp: new Date(),
        showOptions: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-3 md:bottom-6 md:left-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'var(--accent)',
          color: '#fff',
          bottom: 'max(1rem, env(safe-area-inset-bottom, 0px) + 0.5rem)',
        }}
        aria-label={t('chat.open')}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <MessageCircle className="w-6 h-6 transition-transform duration-200" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed left-3 md:left-6 z-50 w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 md:max-w-96 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-left ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-75 pointer-events-none'
        }`}
        style={{
          background: 'var(--background)',
          border: '1px solid color-mix(in srgb, var(--muted) 30%, transparent)',
          maxHeight: 'min(500px, calc(100dvh - 6rem))',
          bottom: 'max(4.5rem, env(safe-area-inset-bottom, 0px) + 4rem)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{
            background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            borderBottom: '1px solid color-mix(in srgb, var(--muted) 25%, transparent)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: 'var(--accent)' }}
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold font-heading text-sm" style={{ color: 'var(--foreground)' }}>
              Portfolio Bot
            </h3>
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
              {userName
                ? `${userName} ${t('chat.chattingWith')}`
                : isWaitingForName
                  ? t('chat.learningName')
                  : t('chat.howCanIHelp')}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          className="overflow-y-auto p-3 md:p-4 space-y-3"
          style={{ maxHeight: 'min(340px, calc(100dvh - 14rem))', minHeight: '200px' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className="animate-[fadeSlideIn_0.3s_ease-out]"
            >
              <div
                className={`flex items-start gap-2 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm"
                  style={{
                    background:
                      message.role === 'user'
                        ? 'var(--secondary)'
                        : 'var(--accent)',
                  }}
                >
                  {message.role === 'user' ? (
                    <User className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-white" />
                  )}
                </div>

                {/* Message Bubble + Inline Name Input */}
                <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl ${
                      message.role === 'user'
                        ? 'rounded-tr-sm'
                        : 'rounded-tl-sm'
                    }`}
                    style={{
                      background:
                        message.role === 'user'
                          ? 'var(--secondary)'
                          : 'color-mix(in srgb, var(--muted) 12%, transparent)',
                      color:
                        message.role === 'user'
                          ? '#fff'
                          : 'var(--foreground)',
                    }}
                  >
                    <ChatMessage content={message.content} isUser={message.role === 'user'} />
                    <p
                      className="text-[10px] mt-1.5 opacity-50 text-right"
                      style={{
                        color: message.role === 'user' ? '#fff' : 'var(--muted)',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Inline Name Input */}
                  {message.isNameRequest && message.role === 'assistant' && isWaitingForName && (
                    <div className="mt-2.5 flex items-center gap-2 w-full">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('chat.namePlaceholder')}
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                        style={{
                          background: 'color-mix(in srgb, var(--muted) 12%, transparent)',
                          color: 'var(--foreground)',
                          border: '1.5px solid var(--accent)',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleNameSubmit();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleNameSubmit}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'var(--accent)' }}
                        title={t('chat.confirm')}
                      >
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </button>
                      {/* Geç butonu - sadece ilk denemede göster */}
                      {nameAttempt === 0 && (
                        <button
                          type="button"
                          onClick={handleSkipName}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: 'color-mix(in srgb, var(--muted) 20%, transparent)',
                            border: '1px solid var(--muted)',
                          }}
                          title={t('chat.skip')}
                        >
                          <SkipForward className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Clickable Options - sadece kullanılmamışsa göster */}
              {message.showOptions && message.role === 'assistant' && !message.optionsUsed && (
                <div className="mt-2.5 ml-9 space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    {quickReplies.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id, message.id)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                          color: 'var(--foreground)',
                          border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
                        }}
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ background: 'var(--accent)', color: '#fff' }}
                        >
                          {option.id}
                        </span>
                        <span className="truncate">{option.label[lang]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-2 animate-[fadeSlideIn_0.2s_ease-out]">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'var(--accent)' }}
              >
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{
                  background: 'color-mix(in srgb, var(--muted) 12%, transparent)',
                }}
              >
                <div className="flex gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: 'var(--accent)', animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: 'var(--accent)', animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: 'var(--accent)', animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Main Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t"
          style={{ borderColor: 'color-mix(in srgb, var(--muted) 25%, transparent)' }}
        >
          <div className="flex gap-2">
            <input
              ref={mainInputRef}
              type="text"
              value={isWaitingForName ? '' : input}
              onChange={(e) => {
                if (!isWaitingForName) setInput(e.target.value);
              }}
              placeholder={
                isWaitingForName
                  ? t('chat.nameFromAbove')
                  : t('chat.messagePlaceholder')
              }
              className="flex-1 px-4 py-2 rounded-full text-sm outline-none transition-all"
              style={{
                background: 'color-mix(in srgb, var(--muted) 8%, transparent)',
                color: 'var(--foreground)',
                border: '1px solid color-mix(in srgb, var(--muted) 30%, transparent)',
                opacity: isWaitingForName ? 0.4 : 1,
                cursor: isWaitingForName ? 'not-allowed' : 'text',
              }}
              disabled={isWaitingForName || isLoading}
            />
            <button
              type="submit"
              disabled={isWaitingForName || isLoading || !input.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{ background: 'var(--accent)' }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
