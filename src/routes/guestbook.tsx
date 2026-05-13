import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Bot,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button as MovingBorderButton } from "../components/ui/moving-border";

// --- Types & Helpers ---
type GuestbookMessage = {
  id: number;
  displayName: string;
  message: string;
  createdAt: string;
};

type MessagesResponse = {
  error?: string;
  messages?: GuestbookMessage[];
};

type CreateMessageResponse = {
  error?: string;
  message?: GuestbookMessage;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

const apiPath = (path: string) => `${import.meta.env.VITE_GUESTBOOK_API_BASE || ""}${path}`;

// --- Route Definition ---
export const Route = createFileRoute("/guestbook")({
  component: GuestbookPage,
});

function GuestbookPage() {
  const { isDark, toggleTheme } = useApp();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = useMemo(() => 500 - message.length, [message]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiPath("/api/guestbook/messages"));
      const data = await response.json() as MessagesResponse;
      if (!response.ok) {
        throw new Error(data.error || `请求失败: ${response.status}`);
      }
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法加载留言列表。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(apiPath("/api/guestbook/messages"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName,
          message
        })
      });
      const data = await response.json() as CreateMessageResponse;
      if (!response.ok) {
        throw new Error(data.error || `请求失败: ${response.status}`);
      }
      if (data.message) {
        setMessages((current) => [data.message as GuestbookMessage, ...current].slice(0, 50));
      }
      setMessage("");
      setDisplayName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法发布留言。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-12 md:py-24 space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className={`lg:col-span-7 ${isDark ? 'bg-[#1C2026]/50 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} backdrop-blur-xl rounded-[48px] border p-8 md:p-12 flex flex-col justify-center transition-colors duration-500`}>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-8">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-5xl md:text-6xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} mb-6 uppercase leading-none`}>
              Legacy <br/><span className="text-indigo-500">Board</span>
            </h1>
            <p className="text-slate-500 leading-relaxed max-w-md font-medium">
              在神经网络中留下你的印记。留言将持久化存储在 D1 数据库中，并通过边缘缓存实现全球极速访问。
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`lg:col-span-5 ${isDark ? 'bg-[#16191F] border-white/5' : 'bg-white border-slate-200'} rounded-[48px] p-8 md:p-10 border shadow-2xl transition-colors duration-500`}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">信号传输</p>
                <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>发布留言</h2>
              </div>
              <Sparkles className="w-7 h-7 text-yellow-300" />
            </div>

            <div className="space-y-6">
              <label className="block">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-4">昵称</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value.slice(0, 40))}
                  placeholder="匿名实体"
                  className={`w-full ${isDark ? 'bg-black/20 border-white/5 focus:bg-black/40' : 'bg-slate-50 border-slate-200 focus:bg-white'} border rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 ${isDark ? 'text-white' : 'text-slate-900'}`}
                />
              </label>

              <label className="block">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-4">留言内容</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value.slice(0, 500))}
                  placeholder="虚空中回荡着什么声音？"
                  rows={5}
                  className={`w-full ${isDark ? 'bg-black/20 border-white/5 focus:bg-black/40' : 'bg-slate-50 border-slate-200 focus:bg-white'} border rounded-[32px] px-5 py-5 text-sm outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-400 ${isDark ? 'text-white' : 'text-slate-900'}`}
                />
              </label>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <span className={`text-[10px] font-black uppercase tracking-widest ${remaining < 40 ? "text-amber-500" : "text-slate-500"}`}>
                还剩 {remaining} 字符
              </span>
              <MovingBorderButton
                type="submit"
                disabled={submitting || message.trim().length < 2}
                borderRadius="1rem"
                containerClassName="w-40"
                className={`${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200'} font-black text-[10px] uppercase tracking-widest text-indigo-500`}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="ml-2">发送</span>
              </MovingBorderButton>
            </div>
          </form>
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-[32px] px-8 py-5 flex items-center gap-4 text-xs font-black uppercase tracking-widest">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <section className={`${isDark ? 'bg-[#1C2026]/30 border-white/5' : 'bg-white border-slate-100 shadow-inner'} backdrop-blur-xl rounded-[64px] border p-8 md:p-16 transition-colors duration-500`}>
          <div className="flex items-center justify-between gap-6 mb-12">
            <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>神经反馈</h2>
            <div className={`flex items-center gap-3 px-5 py-2.5 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-full border`}>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                {messages.length} 条数据
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 flex flex-col items-center justify-center gap-6"
              >
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">正在同步反馈...</p>
              </motion.div>
            ) : messages.length > 0 ? (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {messages.map((item) => (
                  <article
                    key={item.id}
                    className={`group ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'} rounded-[40px] p-8 border transition-all duration-500`}
                  >
                    <div className="flex items-start justify-between gap-6 mb-6">
                      <div>
                        <h3 className={`font-black tracking-tight text-lg group-hover:text-indigo-500 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.displayName}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <div className={`w-10 h-10 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'} rounded-xl flex items-center justify-center border group-hover:border-indigo-500/30 transition-all`}>
                        <MessageCircle className="w-5 h-5 text-indigo-500" />
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.message}</p>
                  </article>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`py-32 text-center rounded-[40px] border border-dashed ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'}`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">虚空中一片沉寂。</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
