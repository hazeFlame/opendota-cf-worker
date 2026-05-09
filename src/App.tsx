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
  Clock
} from "lucide-react";
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";

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
const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number | null, color: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900 tracking-tight">{value ?? 'N/A'}</p>
  </div>
);

const getRankDetails = (tier: number | null) => {
  if (!tier) return { name: "Unranked", color: "text-slate-500", bg: "bg-slate-50" };
  const star = tier % 10;
  const level = Math.floor(tier / 10);
  const ranks = ["Unknown", "Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
  const name = ranks[level] || "Immortal";
  
  const colors: Record<string, { text: string, bg: string }> = {
    Herald: { text: "text-slate-500", bg: "bg-slate-50" },
    Guardian: { text: "text-amber-700", bg: "bg-amber-50" },
    Crusader: { text: "text-emerald-700", bg: "bg-emerald-50" },
    Archon: { text: "text-blue-700", bg: "bg-blue-50" },
    Legend: { text: "text-indigo-700", bg: "bg-indigo-50" },
    Ancient: { text: "text-purple-700", bg: "bg-purple-50" },
    Divine: { text: "text-orange-700", bg: "bg-orange-50" },
    Immortal: { text: "text-red-700", bg: "bg-red-50" }
  };

  const style = colors[name] || colors.Herald;
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
          <div className="max-w-md w-full bg-white p-12 rounded-[48px] shadow-xl border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8 mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-10">We encountered an unexpected error while rendering this page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
            >
              Reload Application
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
  const [searchId, setSearchId] = useState("843948879");
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const data = await response.json();
      
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
    fetchPlayerData(searchId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlayerData(searchId);
  };

  const rank = getRankDetails(player?.rank_tier || null);

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase hidden sm:block">DotaPulse</span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input 
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search Account ID..."
              className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-inner"
            />
          </form>

          <div className="hidden md:flex items-center gap-2 pr-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Live Nodes</span>
          </div>
        </div>
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
                <div className="w-20 h-20 border-4 border-blue-50 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-t-blue-600 rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Syncing Player Data</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto aspect-square bg-white border border-gray-100 rounded-[64px] flex flex-col items-center justify-center p-12 text-center shadow-xl"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Access Restricted</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-10">{error}</p>
              <button 
                onClick={() => fetchPlayerData(searchId)}
                className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
              >
                Retry Request
              </button>
            </motion.div>
          ) : player ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-12"
            >
              {/* Profile Bento */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-8 bg-white rounded-[48px] border border-gray-100 p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center gap-10">
                  <div className="relative shrink-0">
                    <img 
                      src={player?.profile?.avatarfull || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                      alt={player?.profile?.personaname || "Avatar"} 
                      className="w-48 h-48 rounded-[42px] object-cover border-8 border-gray-50 shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                    {player?.profile?.plus && (
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-900 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white transform rotate-12">
                        <Plus className="w-6 h-6 text-yellow-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 uppercase">{player?.profile?.personaname || 'Unknown User'}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold mb-10">
                      <span className="flex items-center gap-2 text-gray-400 tracking-wider font-mono">
                        <Hash className="w-4 h-4" /> {player?.profile?.account_id || '------'}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className={`px-4 py-1.5 rounded-full ${rank.bg} ${rank.color} border border-current opacity-70`}>
                        {rank.name}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <button 
                        onClick={() => player?.profile?.profileurl && window.open(player.profile.profileurl, '_blank')}
                        className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-gray-800 transition-all hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 shadow-lg shadow-gray-200 disabled:opacity-50"
                        disabled={!player?.profile?.profileurl}
                      >
                        Visit Profile <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-3.5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl hover:text-blue-600 hover:border-blue-100 transition-all">
                        <History className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-blue-600 rounded-[48px] p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-blue-200">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-200 mb-6">Expert Analysis</p>
                    <p className="text-2xl font-bold leading-tight tracking-tight">
                      Skill level estimated at <span className="bg-white text-blue-600 px-2 py-0.5 rounded-lg">{player?.computed_mmr ? Math.round(player.computed_mmr) : '0'}</span> MMR.
                    </p>
                  </div>
                  <div className="pt-6 mt-10 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-100">Live Status</span>
                    <span className="flex items-center gap-2 text-xs font-bold">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                  icon={TrendingUp} 
                  label="Matchmaking Rating" 
                  value={player?.computed_mmr ? Math.round(player.computed_mmr) : '-'} 
                  color="bg-blue-600" 
                />
                <StatCard 
                  icon={Zap} 
                  label="Turbo Rating" 
                  value={player?.computed_mmr_turbo ? Math.round(player.computed_mmr_turbo) : '-'} 
                  color="bg-indigo-600" 
                />
                <StatCard 
                  icon={ShieldCheck} 
                  label="Cheese Collection" 
                  value={player?.profile?.cheese ?? 0} 
                  color="bg-amber-500" 
                />
                <StatCard 
                  icon={Clock} 
                  label="Last Observed" 
                  value={player?.profile?.last_login ? new Date(player.profile.last_login).toLocaleDateString() : '-'} 
                  color="bg-gray-900" 
                />
              </div>

              {/* Detailed Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Aliases Timeline */}
                <div className="lg:col-span-12 bg-white rounded-[48px] border border-gray-100 p-10 md:p-12 shadow-sm">
                  <h3 className="text-2xl font-black text-gray-900 mb-10 tracking-tight flex items-center gap-4">
                    <History className="w-8 h-8 text-blue-600" />
                    Identity History
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {player?.aliases && player.aliases.length > 0 ? (
                      player.aliases.map((alias, idx) => (
                        <div key={idx} className="p-6 rounded-[32px] bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white transition-all group flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-bold text-gray-900 tracking-tight">{alias.personaname}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {new Date(alias.name_since).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))
                    ) : (
                      <div className="lg:col-span-3 py-12 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200 italic text-gray-400 text-sm">
                        No alias data found for this operative.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-20 text-center border-t border-gray-100 mt-20">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.8em] mb-12 select-none">Distributed Analytics Platform</p>
        <div className="flex justify-center gap-10 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <Trophy className="w-8 h-8" />
          <ShieldCheck className="w-8 h-8" />
          <Target className="w-8 h-8" />
          <Activity className="w-8 h-8" />
        </div>
      </footer>
    </div>
  );
}

