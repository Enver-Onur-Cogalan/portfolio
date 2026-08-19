'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, MessageCircle, Bot, User, Check, SkipForward, CornerDownRight, RotateCcw } from 'lucide-react';
import { type SectionId, type VisitorPath } from '@/lib/chat/responses';
import { containsProfanity } from '@/lib/chat/profanity';
import { emptyContext, type ConversationContext } from '@/lib/chat/matcher';
import ChatMessage from './ChatMessage';
import { useLanguage } from '@/context/LanguageContext';
import { scrollToSection as smoothScrollToSection } from '@/lib/scroll';

interface Suggestion {
  id: string;
  label: string;
  query: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  showOptions: boolean;
  isNameRequest?: boolean;
  optionsUsed?: boolean;
  isError?: boolean;
  sectionId?: SectionId;
  /** Bu yanıttan sonra sunulan takip konuları */
  suggestions?: Suggestion[];
  /** Ziyaretçi amacını soran mesaj */
  isPathQuestion?: boolean;
}

type ChatState = 'initial' | 'waiting_for_name' | 'choosing_path' | 'chatting';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('initial');
  const [userName, setUserName] = useState<string | null>(null);
  const [nameAttempt, setNameAttempt] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  // Konuşma bağlamı istemcide yaşar; sunucu durum tutmuyor.
  const contextRef = useRef<ConversationContext>(emptyContext);

  const { lang, t } = useLanguage();

  const isWaitingForName = chatState === 'waiting_for_name';

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...message, id: createId(), timestamp: new Date() }]);
  }, []);

  const markOptionsUsedFor = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, optionsUsed: true } : msg))
    );
  }, []);

  // Sohbet ilk açıldığında karşılama
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: createId(),
          role: 'assistant',
          content: t('chat.greeting'),
          timestamp: new Date(),
          showOptions: false,
          isNameRequest: true,
        },
      ]);
      setChatState('waiting_for_name');
    }
  }, [isOpen, messages.length, t]);

  // Escape ile kapat
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isWaitingForName) {
      const id = setTimeout(() => nameInputRef.current?.focus(), 150);
      return () => clearTimeout(id);
    }
  }, [isWaitingForName, messages.length]);

  useEffect(() => {
    if (chatState === 'chatting') {
      const id = setTimeout(() => mainInputRef.current?.focus(), 150);
      return () => clearTimeout(id);
    }
  }, [chatState]);

  const scrollToSection = useCallback((sectionId: SectionId) => {
    smoothScrollToSection(sectionId);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  // ─── API çağrısı ───────────────────────────────────────────
  const askBot = useCallback(
    async (payload: { message: string; visitorPath?: VisitorPath; pathIntro?: boolean }) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, lang, context: contextRef.current }),
        });

        const data = await response.json();

        if (data.context) contextRef.current = data.context;

        if (data.profanityDetected) {
          setIsLoading(false);
          setShakeInput(true);
          setTimeout(() => setShakeInput(false), 500);
          addMessage({
            role: 'assistant',
            content: data.response,
            showOptions: false,
            isError: true,
          });
          return;
        }

        await new Promise((r) => setTimeout(r, data.typingDelay ?? 500));

        addMessage({
          role: 'assistant',
          content: data.response ?? t('chat.error'),
          showOptions: data.showOptions ?? false,
          sectionId: data.sectionId,
          suggestions: Array.isArray(data.suggestions) ? data.suggestions : undefined,
          isError: response.status >= 400,
        });

        if (data.sectionId && data.autoScrollDelay) {
          setTimeout(() => scrollToSection(data.sectionId), data.autoScrollDelay);
        }
      } catch {
        addMessage({ role: 'assistant', content: t('chat.error'), showOptions: false, isError: true });
      } finally {
        setIsLoading(false);
      }
    },
    [lang, t, addMessage, scrollToSection]
  );

  const handleSuggestionClick = async (suggestion: Suggestion, parentMessageId: string) => {
    if (isLoading) return;
    markOptionsUsedFor(parentMessageId);
    addMessage({ role: 'user', content: suggestion.label, showOptions: false });
    await askBot({ message: suggestion.query });
  };

  const handlePathClick = async (path: VisitorPath, label: string, parentMessageId: string) => {
    if (isLoading) return;
    markOptionsUsedFor(parentMessageId);
    setChatState('chatting');
    addMessage({ role: 'user', content: label, showOptions: false });
    await askBot({ message: label, visitorPath: path, pathIntro: true });
  };

  // ─── İsim akışı ────────────────────────────────────────────
  const finishNameStep = (greetingKey: string, name?: string) => {
    // İsimden sonra doğrudan konu listesi sunmak yerine ziyaretçinin neden
    // geldiğini soruyoruz; cevabına göre bambaşka bir konu seti açılıyor.
    setChatState('choosing_path');
    setInput('');
    addMessage({
      role: 'assistant',
      content: `${name ? t(greetingKey).replace(/\{name\}/g, name) : t(greetingKey)}\n\n${t('chat.pathQuestion')}`,
      showOptions: false,
      isPathQuestion: true,
    });
  };

  const handleNameSubmit = () => {
    const trimmed = input.trim();

    if (!trimmed) {
      if (nameAttempt === 0) {
        setNameAttempt(1);
        setInput('');
        addMessage({
          role: 'assistant',
          content: t('chat.nameRetry'),
          showOptions: false,
          isNameRequest: true,
        });
      } else {
        finishNameStep('chat.nameSkip');
      }
      return;
    }

    if (containsProfanity(trimmed)) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      setInput('');
      // Eskiden burada sohbet kalıcı olarak kilitleniyordu. Artık isim
      // adımı atlanıp normal sohbete geçiliyor — kimse kapı dışında kalmıyor.
      addMessage({ role: 'assistant', content: t('chat.profanity'), showOptions: false, isError: true });
      setTimeout(() => finishNameStep('chat.nameSkip'), 1200);
      return;
    }

    setUserName(trimmed);
    finishNameStep('chat.nameSuccess', trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isWaitingForName) {
      handleNameSubmit();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    addMessage({ role: 'user', content: trimmed, showOptions: false });
    setInput('');
    await askBot({ message: trimmed });
  };

  const resetChat = () => {
    contextRef.current = emptyContext;
    setMessages([]);
    setChatState('initial');
    setUserName(null);
    setNameAttempt(0);
    setInput('');
  };

  const timeFormatter = lang === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <>
      {/* Sohbet düğmesi */}
      <button
        ref={toggleButtonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 left-3 md:bottom-6 md:left-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ background: 'var(--accent)', color: '#fff', outlineColor: 'var(--accent)' }}
        aria-label={t('chat.open')}
        aria-expanded={isOpen}
        aria-controls="portfolio-chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Sohbet penceresi */}
      <div
        id="portfolio-chat"
        role="dialog"
        aria-label="Portfolio Bot"
        aria-hidden={!isOpen}
        className={`fixed left-3 md:left-6 z-50 w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 md:max-w-96 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-left ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
        }`}
        style={{
          background: 'var(--background)',
          border: '1px solid color-mix(in srgb, var(--muted) 30%, transparent)',
          maxHeight: 'min(500px, calc(100dvh - 6rem))',
          bottom: '4.5rem',
        }}
      >
        {/* Başlık */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{
            background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            borderBottom: '1px solid color-mix(in srgb, var(--muted) 25%, transparent)',
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'var(--accent)' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold font-heading text-sm" style={{ color: 'var(--foreground)' }}>
              Portfolio Bot
            </h2>
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
              {userName
                ? `${userName} ${t('chat.chattingWith')}`
                : isWaitingForName
                  ? t('chat.learningName')
                  : t('chat.howCanIHelp')}
            </p>
          </div>
          {messages.length > 1 && (
            <button
              type="button"
              onClick={resetChat}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[color-mix(in_srgb,var(--muted)_15%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: 'var(--muted)', outlineColor: 'var(--accent)' }}
              aria-label={t('chat.reset')}
              title={t('chat.reset')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mesajlar */}
        <div
          className="overflow-y-auto p-3 md:p-4 space-y-3"
          style={{ maxHeight: 'min(340px, calc(100dvh - 14rem))', minHeight: '200px' }}
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.map((message) => (
            <div key={message.id} className="animate-[fadeSlideIn_0.3s_ease-out] motion-reduce:animate-none">
              <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm"
                  style={{ background: message.role === 'user' ? 'var(--secondary)' : 'var(--accent)' }}
                  aria-hidden="true"
                >
                  {message.role === 'user' ? (
                    <User className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-white" />
                  )}
                </div>

                <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl ${message.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'} ${
                      message.isError ? 'animate-[borderPulse_0.5s_ease-in-out_3] motion-reduce:animate-none' : ''
                    }`}
                    style={{
                      background:
                        message.role === 'user'
                          ? 'var(--secondary)'
                          : 'color-mix(in srgb, var(--muted) 12%, transparent)',
                      color: message.role === 'user' ? '#fff' : 'var(--foreground)',
                      borderWidth: message.isError ? '2px' : '0px',
                      borderStyle: 'solid',
                      borderColor: 'rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    <ChatMessage content={message.content} isUser={message.role === 'user'} />
                    <p
                      className="text-[10px] mt-1.5 opacity-50 text-right"
                      style={{ color: message.role === 'user' ? '#fff' : 'var(--muted)' }}
                    >
                      {message.timestamp.toLocaleTimeString(timeFormatter, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* İlgili bölüme git — otomatik kaydırma yerine kullanıcı kararı */}
                  {message.sectionId && message.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => scrollToSection(message.sectionId!)}
                      className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ color: 'var(--accent)', outlineColor: 'var(--accent)' }}
                    >
                      <CornerDownRight className="w-3.5 h-3.5" aria-hidden="true" />
                      {t('chat.goToSection')}
                    </button>
                  )}

                  {/* İsim girişi */}
                  {message.isNameRequest && message.role === 'assistant' && isWaitingForName && (
                    <div className="mt-2.5 flex items-center gap-2 w-full">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('chat.namePlaceholder')}
                        maxLength={40}
                        aria-label={t('chat.namePlaceholder')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all ${
                          shakeInput ? 'animate-[shake_0.5s_ease-in-out] motion-reduce:animate-none' : ''
                        }`}
                        style={{
                          background: 'color-mix(in srgb, var(--muted) 12%, transparent)',
                          color: 'var(--foreground)',
                          border: '1.5px solid var(--accent)',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameSubmit();
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleNameSubmit}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'var(--accent)' }}
                        aria-label={t('chat.confirm')}
                        title={t('chat.confirm')}
                      >
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </button>
                      {nameAttempt === 0 && (
                        <button
                          type="button"
                          onClick={() => finishNameStep('chat.nameSkip')}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: 'color-mix(in srgb, var(--muted) 20%, transparent)',
                            border: '1px solid var(--muted)',
                          }}
                          aria-label={t('chat.skip')}
                          title={t('chat.skip')}
                        >
                          <SkipForward className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ziyaretçi amacı — isimden hemen sonra tek sefer sorulur */}
              {message.isPathQuestion && !message.optionsUsed && (
                <div className="mt-2.5 ml-9 mr-1 flex flex-col gap-1.5">
                  {(['hiring', 'technical', 'browsing'] as VisitorPath[]).map((path) => (
                    <button
                      key={path}
                      onClick={() => handlePathClick(path, t(`chat.path.${path}`), message.id)}
                      disabled={isLoading}
                      className="text-left px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                        color: 'var(--foreground)',
                        border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
                        outlineColor: 'var(--accent)',
                      }}
                    >
                      {t(`chat.path.${path}`)}
                    </button>
                  ))}
                </div>
              )}

              {/* Takip önerileri — her yanıt sohbeti bir adım ileri taşır */}
              {message.suggestions && message.suggestions.length > 0 && !message.optionsUsed && (
                <div className="mt-2.5 ml-9 mr-1">
                  <p className="text-[10px] mb-1.5 opacity-60" style={{ color: 'var(--muted)' }}>
                    {t('chat.suggestionsTitle')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {message.suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion, message.id)}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{
                          background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                          color: 'var(--foreground)',
                          border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
                          outlineColor: 'var(--accent)',
                        }}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2" aria-label={t('chat.learningName')}>
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'var(--accent)' }}
                aria-hidden="true"
              >
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ background: 'color-mix(in srgb, var(--muted) 12%, transparent)' }}
              >
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full animate-bounce motion-reduce:animate-none"
                      style={{ background: 'var(--accent)', animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Mesaj girişi */}
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
              placeholder={isWaitingForName ? t('chat.nameFromAbove') : t('chat.messagePlaceholder')}
              aria-label={t('chat.messagePlaceholder')}
              maxLength={500}
              className={`flex-1 px-4 py-2 rounded-full text-sm outline-none transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
                shakeInput && !isWaitingForName ? 'animate-[shake_0.5s_ease-in-out] motion-reduce:animate-none' : ''
              }`}
              style={{
                background: 'color-mix(in srgb, var(--muted) 8%, transparent)',
                color: 'var(--foreground)',
                border: '1px solid color-mix(in srgb, var(--muted) 30%, transparent)',
                outlineColor: 'var(--accent)',
                opacity: isWaitingForName ? 0.4 : 1,
                cursor: isWaitingForName ? 'not-allowed' : 'text',
              }}
              disabled={isWaitingForName || isLoading}
            />
            <button
              type="submit"
              disabled={isWaitingForName || isLoading || !input.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: 'var(--accent)', outlineColor: 'var(--accent)' }}
              aria-label="Gönder"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(239, 68, 68, 0); box-shadow: none; }
          50% { border-color: rgba(239, 68, 68, 0.8); box-shadow: 0 0 12px rgba(239, 68, 68, 0.6); }
        }
      `}</style>
    </>
  );
}
