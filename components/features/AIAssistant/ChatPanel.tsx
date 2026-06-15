'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientBrowser } from '@/lib/supabase-client';
import { fetchChatHistory, ChatHistoryItem } from '@/lib/actions/chat';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  createdAt: string;
}

const SUGGESTED_QUESTIONS = [
  "Find me something like Interstellar",
  "I'm feeling sad, what should I watch?",
  "Recommend a gym playlist",
  "Best dark anime with amazing fights",
  "What's trending in anime this week?"
];

function createTempId(prefix: 'user' | 'assistant' | 'thinking' = 'assistant') {
  return `temp-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const supabase = createClientBrowser();
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(u);
        setAuthChecked(true);

        if (u) {
          const history = await fetchChatHistory(50);
          if (!mounted) return;
          const ordered: ChatMessage[] = [...history]
            .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
            .map((msg: ChatHistoryItem) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              metadata: msg.metadata,
              createdAt: new Date(msg.createdAt).toISOString(),
            }));
          setMessages(ordered);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setAuthChecked(true);
      }
    })();

    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading || !user) return;

      const userMessage: ChatMessage = {
        id: createTempId('user'),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setStreamingContent('');

      const controller = new AbortController();
      abortRef.current = controller;

      let assistantId = createTempId('assistant');
      let assistantContent = '';
      let didError = false;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userId: user.id,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Parse SSE: events are separated by blank lines, fields are "event:" and "data:".
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let sepIndex: number;
          // eslint-disable-next-line no-cond-assign
          while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
            const rawEvent = buffer.slice(0, sepIndex);
            buffer = buffer.slice(sepIndex + 2);

            const eventLines = rawEvent.split('\n');
            let eventName = 'message';
            let dataLine = '';
            for (const line of eventLines) {
              if (line.startsWith('event:')) {
                eventName = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataLine += line.slice(5).trim();
              }
            }
            if (!dataLine) continue;

            if (eventName === 'delta') {
              try {
                const parsed = JSON.parse(dataLine);
                if (typeof parsed.delta === 'string') {
                  assistantContent += parsed.delta;
                  setStreamingContent(assistantContent);
                }
              } catch {
                // tolerate malformed chunks
              }
            } else if (eventName === 'error') {
              didError = true;
              try {
                const parsed = JSON.parse(dataLine);
                assistantContent = parsed.error || 'Sorry, something went wrong.';
              } catch {
                assistantContent = 'Sorry, something went wrong.';
              }
              setStreamingContent(assistantContent);
            }
          }
        }

        if (didError || !assistantContent) {
          assistantContent =
            assistantContent || 'Sorry, I encountered an error. Please try again!';
        }

        const finalMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: assistantContent,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, finalMessage]);
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          return;
        }
        console.error('Error sending message:', error);
        const fallback: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again!',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallback]);
      } finally {
        setIsLoading(false);
        setStreamingContent('');
        abortRef.current = null;
      }
    },
    [isLoading, messages, user]
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleSuggestedQuestion = (question: string) => {
    void sendMessage(question);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setStreamingContent('');
  };

  const showEmptyState = messages.length === 0 && !streamingContent;
  const requiresAuth = authChecked && !user;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open CineVerse AI Assistant"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent-blue rounded-full flex items-center justify-center shadow-lg hover:bg-accent-blue/90 transition-all hover:scale-105"
      >
        <BrainStarIcon className="w-7 h-7 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-background-secondary border-l border-accent-blue/10 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-accent-blue/10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center animate-glow">
                    <BrainStarIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-outfit text-primary text-sm font-medium">
                      CineVerse AI Assistant
                    </h3>
                    <p className="text-text-tertiary text-xs">Powered by GPT-4o</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-text-secondary hover:text-primary transition-colors"
                  aria-label="Close assistant"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {requiresAuth && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <div className="w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center">
                      <BrainStarIcon className="w-8 h-8 text-accent-blue" />
                    </div>
                    <h4 className="font-outfit text-primary text-lg">Sign in to chat</h4>
                    <p className="text-text-tertiary text-sm max-w-xs">
                      Log in to get personalized recommendations based on your Entertainment DNA.
                    </p>
                  </div>
                )}

                {!requiresAuth && showEmptyState && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center animate-glow">
                      <BrainStarIcon className="w-8 h-8 text-accent-blue" />
                    </div>
                    <h4 className="font-outfit text-primary text-lg">Ask me anything!</h4>
                    <p className="text-text-tertiary text-sm max-w-xs">
                      I can help you discover movies, anime, music, and more based on your taste.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestedQuestion(q)}
                          className="px-3 py-1.5 bg-background-tertiary hover:bg-accent-blue/10 text-text-secondary text-xs rounded-full border border-accent-blue/10 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!requiresAuth &&
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          msg.role === 'user'
                            ? 'bg-accent-blue text-white rounded-br-md'
                            : 'bg-background-tertiary text-primary rounded-bl-md border border-accent-blue/10'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.role === 'user' ? 'text-white/70' : 'text-text-tertiary'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                {!requiresAuth && streamingContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-background-tertiary text-primary rounded-bl-md border border-accent-blue/10">
                      <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                    </div>
                  </div>
                )}

                {!requiresAuth && isLoading && !streamingContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-background-tertiary rounded-bl-md border border-accent-blue/10">
                      <div className="flex space-x-1.5">
                        <div
                          className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-accent-blue/10"
              >
                <div className="flex items-center space-x-2 bg-background-tertiary rounded-xl px-4 py-2 border border-accent-blue/10 focus-within:border-accent-blue transition-colors">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={requiresAuth ? 'Sign in to chat…' : 'Ask me anything...'}
                    className="flex-1 bg-transparent text-primary text-sm placeholder-text-tertiary focus:outline-none"
                    disabled={isLoading || requiresAuth}
                  />
                  <button
                    type="button"
                    className="p-1.5 text-text-tertiary hover:text-primary transition-colors"
                    aria-label="Voice input (coming soon)"
                    title="Voice input coming soon"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
                      />
                    </svg>
                  </button>
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="p-1.5 bg-accent-coral text-white rounded-lg hover:bg-accent-coral/90 transition-colors"
                      aria-label="Stop generating"
                      title="Stop"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim() || requiresAuth}
                      className="p-1.5 bg-accent-blue text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-blue/90 transition-colors"
                      aria-label="Send message"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19V5m0 0l-7 7m7-7l7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function BrainStarIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4L12 3z" fill="currentColor" />
      <path d="M5 14.5c0-1.4 1-2.5 2.3-2.7.1-1.4 1.3-2.5 2.7-2.5.5-1 1.5-1.7 2.6-1.7" />
      <path d="M19 14.5c0-1.4-1-2.5-2.3-2.7-.1-1.4-1.3-2.5-2.7-2.5-.4-.7-1.1-1.3-1.9-1.6" />
      <path d="M7.5 18.5c.7 1 1.8 1.6 3 1.6h3c2.2 0 4-1.8 4-4v-.1" />
      <path d="M5 16.5v.6c0 1.4 1.1 2.5 2.5 2.5" />
    </svg>
  );
}
