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
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Activity,
  History,
  Hash,
  ChevronRight,
  Plus,
  Zap,
  Clock,
  MessageCircle,
  Bot,
  Sun,
  Moon
} from "lucide-react";
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import Guestbook from "./Guestbook";
import RoleChat from "./RoleChat";
import { BackgroundBeams } from "./components/ui/background-beams";
import { Button as MovingBorderButton } from "./components/ui/moving-border";

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

// --- Icons & Helpers ---
const StatCard = ({ icon: Icon, label, value, color, isDark }: { icon: any, label: string, value: string | number | null, color: string, isDark?: boolean }) => (
  <div className={`${isDark ? 'bg-[#1C2026] border-white/5 hover:bg-[#252A32]' : 'bg-white border-slate-100 hover:shadow-md'} p-6 rounded-3xl border shadow-sm transition-all group`}>
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>{value ?? '-'}</p>
  </div>
);

const getRankDetails = (tier: number | null) => {
  if (!tier) return { name: "未定级", color: "text-slate-500", bg: "bg-slate-50" };
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
    bg: style.bg 
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
        <div className="min-h-screen flex items-center justify-center bg-[#0F1115] p-6 text-center selection:bg-indigo-500/30">
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

// --- Main App with Error Boundary Wrapper ---
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
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const [searchId, setSearchId] = useState("843948879");
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  const fetchPlayerData = async (id: string) => {
    if (!id || id.trim() === "") {
      setError("Please enter a valid Account ID");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://old-star-9b17.myhazeflame.workers.dev/api/v1/player?id=${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Player profile not found in database.");
        throw new Error(`API returned error status: ${response.status}`);
      }
      const data = await response.json() as PlayerData;
      
      // Defensive check: verify the essential data structure exists
      if (!data || !data.profile) {
        throw new Error("Received an empty or invalid response from the server.");
      }
      
      setPlayer(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err instanceof Error ? err.message : "Connect failed");
      setPlayer(null); // Clear previous player on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (currentPath === "/dashboard") {
      fetchPlayerData(searchId);
    }
  }, [currentPath]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlayerData(searchId);
  };

  const rank = getRankDetails(player?.rank_tier || null);

  if (currentPath.startsWith("/chat/")) {
    const characterId = currentPath.split("/")[2];
    return (
      <RoleChat 
        onNavigateHome={() => navigate("/")} 
        onNavigateGuestbook={() => navigate("/guestbook")}
        isDark={isDark}
        toggleTheme={toggleTheme}
        initialCharacterId={characterId}
      />
    );
  }

  if (currentPath === "/guestbook") {
    return (
      <Guestbook 
        onNavigateHome={() => navigate("/")} 
        isDark={isDark} 
        toggleTheme={toggleTheme}
      />
    );
  }

  // Default to RoleChat for / and any other undefined routes
  return (
    <RoleChat 
      onNavigateHome={() => navigate("/")} 
      onNavigateGuestbook={() => navigate("/guestbook")}
      isDark={isDark}
      toggleTheme={toggleTheme}
    />
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0F1115] text-gray-100' : 'bg-[#F8FAFC] text-slate-900'} font-sans selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-500`}>
      {/* Top Navigation */}
      <nav className={`sticky top-0 z-50 ${isDark ? 'bg-[#16191F]/80 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-xl border-b transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className={`font-black text-xl tracking-tighter uppercase hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>DotaPulse</span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-slate-400'} group-focus-within:text-indigo-500 transition-colors`} />
            </div>
            <input 
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="搜索账号 ID..."
              className={`w-full ${isDark ? 'bg-black/20 border-white/5 focus:bg-black/40 text-white' : 'bg-slate-100 border-transparent focus:bg-white text-slate-900'} rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner placeholder:text-slate-500`}
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-3 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-2xl transition-all active:scale-95`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate("/guestbook")}
              className={`hidden sm:flex items-center gap-2 px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-2xl font-bold text-sm transition-all`}
            >
              <MessageCircle className="w-4 h-4" />
              留言板
            </button>

            <button
              onClick={() => navigate("/")}
              className={`hidden sm:flex items-center gap-2 px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-2xl font-bold text-sm transition-all`}
            >
              <Bot className="w-4 h-4" />
              对话
            </button>
          </div>
        </div>
        <BackgroundBeams className="opacity-20" />
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {loading ? (
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
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-md mx-auto aspect-square ${isDark ? 'bg-[#1C2026] border-white/5' : 'bg-white border-slate-100'} border rounded-[64px] flex flex-col items-center justify-center p-12 text-center shadow-2xl`}
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-4 tracking-tight`}>访问受限</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium">{error}</p>
              <button 
                onClick={() => fetchPlayerData(searchId)}
                className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
              >
                重试请求
              </button>
            </motion.div>
          ) : player ? (() => {
            const rank = getRankDetails(player.rank_tier);
            return (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-12"
              >
              {/* Profile Bento */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className={`lg:col-span-8 ${isDark ? 'bg-[#1C2026] border-white/5' : 'bg-white border-slate-100 shadow-sm'} rounded-[48px] border p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 transition-colors duration-500`}>
                  <div className="relative shrink-0">
                    <img 
                      src={player?.profile?.avatarfull || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                      alt={player?.profile?.personaname || "Avatar"} 
                      className={`w-48 h-48 rounded-[42px] object-cover border-8 ${isDark ? 'border-white/5 shadow-2xl shadow-black/50' : 'border-slate-50 shadow-2xl shadow-slate-200'}`}
                      referrerPolicy="no-referrer"
                    />
                    {player?.profile?.plus && (
                      <div className={`absolute -top-4 -right-4 w-12 h-12 ${isDark ? 'bg-black/40 border-white/10' : 'bg-gray-900 border-white'} rounded-3xl flex items-center justify-center shadow-2xl border-4 transform rotate-12`}>
                        <Plus className="w-6 h-6 text-yellow-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h1 className={`text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tighter mb-4 uppercase`}>{player?.profile?.personaname || '未知用户'}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold mb-10">
                      <span className="flex items-center gap-2 text-slate-500 tracking-wider font-mono">
                        <Hash className="w-4 h-4" /> {player?.profile?.account_id || '------'}
                      </span>
                      <span className={`w-1 h-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full`}></span>
                      <span className={`px-4 py-1.5 rounded-full ${rank.bg} ${rank.color} border border-current opacity-70 text-xs font-black uppercase tracking-widest`}>
                        {rank.name}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <button 
                        onClick={() => player?.profile?.profileurl && window.open(player.profile.profileurl, '_blank')}
                        className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:shadow-xl hover:shadow-indigo-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50"
                        disabled={!player?.profile?.profileurl}
                      >
                        访问个人资料 <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className={`p-3.5 ${isDark ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-white border-slate-100 text-slate-400'} border rounded-2xl hover:text-indigo-500 hover:border-indigo-500/30 transition-all`}>
                        <History className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-[48px] p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200 mb-6">专家分析</p>
                    <p className="text-2xl font-bold leading-tight tracking-tight">
                      预估技能等级为 <span className="bg-white text-indigo-600 px-3 py-1 rounded-xl shadow-lg">{player?.computed_mmr ? Math.round(player.computed_mmr) : '0'}</span> MMR。
                    </p>
                  </div>
                  <div className="pt-6 mt-10 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-100">实时状态</span>
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      活跃中
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                  icon={TrendingUp} 
                  label="天梯评分 (MMR)" 
                  value={player?.computed_mmr ? Math.round(player.computed_mmr) : '-'} 
                  color="bg-blue-600"
                  isDark={isDark}
                />
                <StatCard 
                  icon={Zap} 
                  label="加速模式评分" 
                  value={player?.computed_mmr_turbo ? Math.round(player.computed_mmr_turbo) : '-'} 
                  color="bg-indigo-600" 
                  isDark={isDark}
                />
                <StatCard 
                  icon={ShieldCheck} 
                  label="Cheese 收藏" 
                  value={player?.profile?.cheese ?? 0} 
                  color="bg-amber-500" 
                  isDark={isDark}
                />
                <StatCard 
                  icon={Clock} 
                  label="最后在线" 
                  value={player?.profile?.last_login ? new Date(player.profile.last_login).toLocaleDateString() : '-'} 
                  color="bg-slate-900" 
                  isDark={isDark}
                />
              </div>

              {/* Detailed Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Aliases Timeline */}
                <div className={`lg:col-span-12 ${isDark ? 'bg-[#1C2026] border-white/5' : 'bg-white border-slate-100 shadow-sm'} rounded-[48px] border p-10 md:p-12 transition-colors duration-500`}>
                  <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-10 tracking-tight flex items-center gap-4`}>
                    <History className="w-8 h-8 text-indigo-500" />
                    身份历史记录
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {player?.aliases && player.aliases.length > 0 ? (
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
                      <div className={`lg:col-span-3 py-12 text-center ${isDark ? 'bg-white/2 border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'} rounded-[32px] border border-dashed italic text-sm`}>
                        未发现此用户的曾用名数据。
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </motion.div>
            );
      })() : null}
        </AnimatePresence>
      </main>

      <footer className={`max-w-6xl mx-auto px-6 py-20 text-center border-t ${isDark ? 'border-white/5' : 'border-slate-100'} mt-20 transition-colors duration-500`}>
        <p className={`text-[10px] font-black uppercase tracking-[0.8em] mb-12 select-none ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>分布式分析平台</p>
        <div className={`flex justify-center gap-10 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Trophy className="w-8 h-8" />
          <ShieldCheck className="w-8 h-8" />
          <Target className="w-8 h-8" />
          <Activity className="w-8 h-8" />
        </div>
      </footer>
    </div>
  );
}
