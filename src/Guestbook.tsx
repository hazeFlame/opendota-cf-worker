import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

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

type GuestbookProps = {
  onNavigateHome: () => void;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

const apiPath = (path: string) => `${import.meta.env.VITE_GUESTBOOK_API_BASE || ""}${path}`;

export default function Guestbook({ onNavigateHome }: GuestbookProps) {
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
        throw new Error(data.error || `Request failed with ${response.status}`);
      }
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load messages.");
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
        throw new Error(data.error || `Request failed with ${response.status}`);
      }
      if (data.message) {
        setMessages((current) => [data.message as GuestbookMessage, ...current].slice(0, 50));
      }
      setMessage("");
      setDisplayName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase hidden sm:block">DotaPulse</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="px-4 py-3 bg-gray-50 border border-gray-100 text-gray-700 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-white hover:border-gray-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={loadMessages}
              disabled={loading}
              className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50"
              aria-label="Refresh messages"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 bg-white rounded-[48px] border border-gray-100 p-8 md:p-12 shadow-sm">
            <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-100 mb-8">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-5 uppercase">
              Guestbook
            </h1>
            <p className="text-gray-500 leading-7 max-w-2xl">
              Leave a quick anonymous note for this DotaPulse instance. Messages are stored in D1 and the public feed is cached in KV.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 bg-gray-900 rounded-[48px] p-8 md:p-10 shadow-2xl shadow-gray-200 text-white"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-200 mb-2">Anonymous</p>
                <h2 className="text-2xl font-black tracking-tight">Sign the board</h2>
              </div>
              <Sparkles className="w-7 h-7 text-yellow-300" />
            </div>

            <label className="block mb-5">
              <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Display name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value.slice(0, 40))}
                placeholder="Anonymous"
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white/15 transition-all placeholder:text-gray-500"
              />
            </label>

            <label className="block mb-5">
              <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 500))}
                placeholder="Write something short..."
                rows={6}
                className="w-full bg-white/10 border border-white/10 rounded-3xl px-4 py-4 text-sm outline-none focus:border-blue-300 focus:bg-white/15 transition-all resize-none placeholder:text-gray-500"
              />
            </label>

            <div className="flex items-center justify-between gap-4">
              <span className={`text-xs font-bold ${remaining < 40 ? "text-amber-300" : "text-gray-500"}`}>
                {remaining} left
              </span>
              <button
                type="submit"
                disabled={submitting || message.trim().length < 2}
                className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all active:scale-95"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-3xl px-6 py-4 flex items-center gap-3 text-sm font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <section className="bg-white rounded-[48px] border border-gray-100 p-8 md:p-12 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-10">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Latest Messages</h2>
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">
              {messages.length} notes
            </span>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 flex items-center justify-center"
              >
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </motion.div>
            ) : messages.length > 0 ? (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {messages.map((item) => (
                  <article
                    key={item.id}
                    className="bg-gray-50 rounded-[32px] p-6 border border-transparent hover:bg-white hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <h3 className="font-black text-gray-900 tracking-tight">{item.displayName}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <MessageCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    </div>
                    <p className="text-gray-600 text-sm leading-7 break-words">{item.message}</p>
                  </article>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200"
              >
                <p className="text-gray-400 text-sm font-bold">No messages yet.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
