/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  User, 
  Loader2, 
  AlertCircle, 
  Trophy, 
  Target, 
  ShieldCheck,
  Activity,
  History,
  Hash,
  ChevronRight,
  Plus,
  MessageCircle,
  Bot,
  Sun,
  Moon
} from "lucide-react";
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import Guestbook from "./Guestbook";
import RoleChat from "./RoleChat";
import { AppLayout } from "./components/layout/AppLayout";

// --- Types ---
interface PlayerProfile {
  account_id: number;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  plus: boolean;
  cheese: number;
  last_login: string;
}

interface PlayerAlias {
  personaname: string;
  name_since: string;
}

interface PlayerData {
  profile: PlayerProfile;
  rank_tier: number | null;
  computed_mmr: number | null;
  computed_mmr_turbo: number | null;
  aliases: PlayerAlias[];
}

// --- Helpers ---
const getRankDetails = (tier: number | null) => {
  if (!tier) return { name: "未定级", color: "text-slate-500", bg: "bg-slate-50", icon: "" };
  const star = tier % 10;
  const level = Math.floor(tier / 10);
  const ranks = ["未知", "先锋", "卫士", "十字军", "统帅", "传奇", "万古流芳", "超凡入圣", "冠绝一世"];
  const name = ranks[level] || "冠绝一世";
  
  const colors: Record<string, { text: string, bg: string }> = {
    "先锋": { text: "text-slate-500", bg: "bg-slate-50" },
    "卫士": { text: "text-amber-700", bg: "bg-amber-50" },
    "十字军": { text: "text-emerald-700", bg: "bg-emerald-50" },
    "统帅": { text: "text-blue-700", bg: "bg-blue-50" },
    "传奇": { text: "text-indigo-700", bg: "bg-indigo-50" },
    "万古流芳": { text: "text-purple-700", bg: "bg-purple-50" },
    "超凡入圣": { text: "text-orange-700", bg: "bg-orange-50" },
    "冠绝一世": { text: "text-red-700", bg: "bg-red-50" }
  };

  const style = colors[name] || colors["先锋"];
  return { 
    name: `${name} ${star > 0 ? star : ""}`, 
    color: style.text, 
    bg: style.bg,
    icon: "" // Rank icons can be added here
  };
};

// --- Error Boundary ---
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F1115] p-6 text-center">
          <div className="max-w-md w-full bg-[#16191F] p-12 rounded-[48px] shadow-2xl border border-white/5">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 mx-auto border border-red-500/20">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 tracking-tight">System Fault</h2>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">Neural link disrupted. An unexpected variance occurred during rendering.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
            >
              Reboot Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main App ---
export default function SafeApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [searchId, setSearchId] = useState("");
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerData = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const apiBase = import.meta.env.VITE_GUESTBOOK_API_BASE || "";
      const response = await fetch(`${apiBase}/api/players/${id}`);
      if (!response.ok) throw new Error("无法获取玩家数据");
      const data = (await response.json()) as PlayerData;
      setPlayer(data);
      navigate("/dota");
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout 
      isDark={isDark} 
      toggleTheme={toggleTheme} 
      onNavigate={navigate}
      hideShell={currentPath.startsWith("/chat/")}
    >
      <AnimatePresence mode="wait">
        {(() => {
          if (currentPath.startsWith("/chat/")) {
            const characterId = currentPath.split("/")[2];
            return (
              <RoleChat 
                key="chat"
                isDark={isDark}
                toggleTheme={toggleTheme}
                initialCharacterId={characterId}
                onNavigate={navigate}
                onNavigateHome={() => navigate("/")}
                onNavigateGuestbook={() => navigate("/guestbook")}
              />
            );
          }

          if (currentPath === "/guestbook") {
            return (
              <Guestbook 
                key="guestbook"
                onNavigateHome={() => navigate("/")} 
                isDark={isDark} 
                toggleTheme={toggleTheme}
              />
            );
          }

          if (currentPath === "/dota") {
            if (loading) {
              return (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[60vh] flex flex-col items-center justify-center gap-6"
                >
                  <div className="relative">
                    <div className={`w-20 h-20 border-4 ${isDark ? 'border-white/5' : 'border-slate-100'} rounded-full`}></div>
                    <div className="w-20 h-20 border-4 border-t-indigo-500 rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">正在同步玩家数据...</p>
                </motion.div>
              );
            }

            if (error) {
              return (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-md mx-auto my-20 aspect-square ${isDark ? 'bg-[#1C2026] border-white/5' : 'bg-white border-slate-100'} border rounded-[64px] flex flex-col items-center justify-center p-12 text-center shadow-2xl`}
                >
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-4 tracking-tight`}>访问受限</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium">{error}</p>
                  <button 
                    onClick={() => fetchPlayerData(searchId)}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
                  >
                    重试请求
                  </button>
                </motion.div>
              );
            }

            if (player) {
              const rank = getRankDetails(player.rank_tier);
              return (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="max-w-6xl mx-auto px-6 py-12 md:py-24"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 space-y-8">
                      <div className={`${isDark ? 'bg-[#16191F] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} rounded-[48px] p-10 border transition-all duration-500 overflow-hidden relative group`}>
                        <div className="relative z-10 text-center lg:text-left">
                          <div className="relative mb-10 inline-block mx-auto lg:mx-0">
                            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
                            <img 
                              src={player.profile.avatarfull} 
                              alt={player.profile.personaname}
                              className="w-40 h-40 rounded-[48px] border-4 border-white/10 shadow-2xl relative z-10 object-cover mx-auto"
                            />
                          </div>
                          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} mb-3 uppercase leading-none`}>
                            {player.profile.personaname}
                          </h1>
                          <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
                            <span className={`px-4 py-1.5 ${rank.bg} ${rank.color} rounded-full text-[10px] font-black tracking-widest uppercase border border-current opacity-70`}>
                              {rank.name}
                            </span>
                            {player.profile.plus && (
                              <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black tracking-widest uppercase border border-yellow-500/20">
                                Dota Plus
                              </span>
                            )}
                          </div>
                          <div className={`grid grid-cols-2 gap-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} pt-8`}>
                            <div className="space-y-1 text-left">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">胜场率</p>
                              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>54.2%</p>
                            </div>
                            <div className="space-y-1 text-left">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">活跃度</p>
                              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>98</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-8 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                          { label: "平均 KDA", value: "3.84", color: "text-green-500", icon: <Trophy className="w-6 h-6" /> },
                          { label: "参战率", value: "72%", color: "text-blue-500", icon: <Activity className="w-6 h-6" /> },
                          { label: "平均 GPM", value: "542", color: "text-yellow-500", icon: <Target className="w-6 h-6" /> },
                          { label: "平均 XPM", value: "612", color: "text-purple-500", icon: <ShieldCheck className="w-6 h-6" /> }
                        ].map((stat, i) => (
                          <div key={i} className={`${isDark ? 'bg-white/2 border-white/5' : 'bg-slate-50 border-slate-100'} p-8 rounded-[40px] border flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-500`}>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                              <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tighter`}>{stat.value}</p>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white'} border border-transparent`}>
                              {React.cloneElement(stat.icon as React.ReactElement, { className: stat.color + " w-6 h-6" } as React.HTMLAttributes<HTMLElement>)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-10 tracking-tight flex items-center gap-4`}>
                        <History className="w-8 h-8 text-indigo-500" />
                        身份历史记录
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {player.aliases && player.aliases.length > 0 ? (
                          player.aliases.map((alias, idx) => (
                            <div key={idx} className={`${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'} p-6 rounded-[32px] border transition-all group flex items-center justify-between`}>
                              <div className="space-y-1">
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>{alias.personaname}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  {new Date(alias.name_since).toLocaleDateString()}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          ))
                        ) : (
                          <div className={`lg:col-span-3 py-12 text-center ${isDark ? 'bg-white/2 border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'} rounded-[48px] border border-dashed italic text-sm`}>
                            未发现此用户的曾用名数据。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }
          }

          return (
            <RoleChat 
              key="rolechat"
              isDark={isDark}
              toggleTheme={toggleTheme}
              onNavigate={navigate}
              onNavigateHome={() => navigate("/")}
              onNavigateGuestbook={() => navigate("/guestbook")}
            />
          );
        })()}
      </AnimatePresence>
    </AppLayout>
  );
}
