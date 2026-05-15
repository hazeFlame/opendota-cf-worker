import React, { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { motion } from "motion/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, UserRound, Loader2, Send } from "lucide-react";
import { apiPath, messageText, type Conversation } from "./types";

type ConversationPanelProps = {
  conversation: Conversation | null;
  initialMessages?: UIMessage[];
  characterName?: string;
  isLinking?: boolean;
  isDark: boolean;
};

export function ConversationPanel({
  conversation,
  initialMessages = [],
  characterName,
  isLinking = false,
  isDark,
}: ConversationPanelProps) {
  const [input, setInput] = useState("");
  const transport = useMemo(() => {
    const api = conversation
      ? apiPath(`/api/chats/${conversation.id}/messages`)
      : apiPath("/api/chats/pending/messages");
    return new DefaultChatTransport({ api, credentials: "include" });
  }, [conversation?.id]);

  const { messages, sendMessage, status, stop, error: chatError } = useChat({
    transport,
    messages: initialMessages,
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const showThinking = isStreaming && (
    !lastMessage ||
    lastMessage.role === "user" ||
    (lastMessage.role === "assistant" && messageText(lastMessage).trim().length === 0)
  );

  const scrollRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showThinking]);

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || !conversation || isLinking || isStreaming) return;

    setInput("");
    await sendMessage({ text });
  };

  return (
    <>
      <div 
        ref={scrollRef}
        className="flex-1 px-3 py-4 sm:p-6 md:p-10 xl:p-12 overflow-y-auto space-y-4 sm:space-y-6 md:space-y-8 custom-scrollbar"
      >
        {messages.length > 0 ? (
          <>
            {messages.map((message) => {
              const isUser = message.role === "user";
              const text = messageText(message);
              if (!isUser && text.trim().length === 0) {
                return null;
              }

              return (
                <div key={message.id} className={`flex gap-2.5 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] sm:max-w-[min(80%,720px)] rounded-2xl sm:rounded-[24px] px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 text-[14px] leading-6 sm:leading-7 transition-all break-words ${
                    isUser 
                      ? "bg-indigo-600 text-white rounded-tr-none font-medium" 
                      : (isDark ? "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none font-medium" : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none font-medium")
                  }`}>
                    {text}
                  </div>
                  {isUser && (
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${isDark ? 'bg-white/10 border-white/10 text-indigo-400' : 'bg-slate-100 border-slate-200 text-slate-500'} rounded-xl flex items-center justify-center shrink-0 border`}>
                      <UserRound className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>
              );
            })}
            {showThinking && (
              <div className="flex gap-2.5 sm:gap-4 justify-start items-start">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className={`max-w-[82%] sm:max-w-[80%] rounded-2xl sm:rounded-[24px] px-4 sm:px-8 py-4 sm:py-5 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} border rounded-tl-none flex flex-col gap-3 sm:gap-4`}>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1 h-4">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 4 }}
                          animate={{ 
                            height: [4, 16, 8, 14, 4],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut"
                          }}
                          className="w-1 bg-indigo-500 rounded-full"
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {characterName || "实体"} 正在想...
                    </span>
                  </div>
                  <div className="hidden sm:block space-y-2 opacity-20">
                     <div className={`h-2 w-32 ${isDark ? 'bg-white' : 'bg-slate-900'} rounded-full animate-pulse`}></div>
                     <div className={`h-2 w-24 ${isDark ? 'bg-white' : 'bg-slate-900'} rounded-full animate-pulse delay-75`}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full min-h-[280px] sm:min-h-[360px] flex flex-col items-center justify-center text-center p-6 md:p-12">
            <div className={`w-16 h-16 sm:w-24 sm:h-24 ${isDark ? 'bg-white/2 border-white/5' : 'bg-slate-50 border-slate-200'} rounded-3xl sm:rounded-[40px] flex items-center justify-center mb-5 sm:mb-8 border group`}>
              {isLinking ? (
                <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-500 animate-spin" />
              ) : (
                <Bot className={`w-8 h-8 sm:w-12 sm:h-12 ${isDark ? 'text-gray-700' : 'text-slate-300'} group-hover:text-indigo-500 transition-colors duration-300`} />
              )}
            </div>
            <h3 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
              {isLinking ? "正在建立身份链接" : "等待第一句话"}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-sm uppercase tracking-widest leading-relaxed">
              {isLinking ? `${characterName || "角色"} 的对话数据正在同步。` : "对话已经准备好，可以开始发送消息。"}
            </p>
          </div>
        )}
      </div>

      {chatError && (
        <div className="mx-3 sm:mx-8 mb-3 sm:mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 sm:px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.2em]">
          连接错误: {chatError.message}
        </div>
      )}

      <div className={`p-3 sm:p-5 md:p-8 xl:p-10 ${isDark ? 'bg-[#1C2026]/40 border-white/5' : 'bg-slate-50/80 border-slate-100'} border-t transition-colors duration-300`}>
        <form onSubmit={submitMessage} className="relative group">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={conversation ? "将思维传输给实体..." : "正在建立身份链接..."}
            disabled={!conversation || isLinking || isStreaming}
            rows={1}
            className={`min-h-14 sm:min-h-20 w-full ${isDark ? 'bg-black/40 border-white/5 focus:bg-black/60 focus:border-indigo-500/40' : 'bg-white border-slate-200 focus:bg-white focus:border-indigo-400'} border rounded-2xl sm:rounded-[28px] md:rounded-[32px] pl-4 sm:pl-5 md:pl-7 pr-16 sm:pr-24 md:pr-32 py-4 sm:py-5 md:py-6 text-sm outline-none transition-all resize-none disabled:opacity-60 ${isDark ? 'text-white placeholder:text-gray-700' : 'text-slate-900 placeholder:text-slate-300'}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitMessage(e as any);
              }
            }}
          />
          <div className="absolute right-2 sm:right-3 md:right-4 bottom-2 sm:bottom-3 md:bottom-4 top-2 sm:top-3 md:top-4 flex items-center">
            <button
              type={isStreaming ? "button" : "submit"}
              onClick={isStreaming ? () => void stop() : undefined}
              disabled={!conversation || isLinking || (!isStreaming && input.trim().length < 1)}
              className={`h-full aspect-square sm:aspect-auto sm:px-4 md:px-8 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-[0.98] ${
                isStreaming 
                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" 
                : "bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-0"
              }`}
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">{isStreaming ? "中止" : "传输"}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
