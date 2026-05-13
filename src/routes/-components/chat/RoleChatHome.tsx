import React from "react";
import { motion } from "motion/react";
import { Bot, Sparkles, Loader2, UserRound, Trash2, ChevronRight } from "lucide-react";
import { Button as MovingBorderButton } from "../../../components/ui/moving-border";
import { type Character } from "./types";

type RoleChatHomeProps = {
  isDark: boolean;
  name: string;
  setName: (v: string) => void;
  greeting: string;
  setGreeting: (v: string) => void;
  persona: string;
  setPersona: (v: string) => void;
  creating: boolean;
  createCharacter: (e: React.FormEvent) => void;
  showValidationHint: boolean;
  characters: boolean; // Just a flag to check if loading
  loading: boolean;
  characterList: Character[];
  deletingId: string | null;
  deleteCharacter: (id: string, e: React.MouseEvent) => void;
  startConversation: (c: Character) => void;
};

export function RoleChatHome({
  isDark,
  name, setName,
  greeting, setGreeting,
  persona, setPersona,
  creating,
  createCharacter,
  showValidationHint,
  loading,
  characterList,
  deletingId,
  deleteCharacter,
  startConversation
}: RoleChatHomeProps) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col gap-12 overflow-y-auto pr-2 custom-scrollbar"
    >
      {/* High-Tech Character Creation Console */}
      <section className="relative group shrink-0">
        <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[40px] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200`}></div>
        <div className={`relative px-12 py-12 ${isDark ? 'bg-[#16191F]/80 border-white/10' : 'bg-white/80 border-slate-200'} backdrop-blur-3xl rounded-[40px] border transition-all duration-500`}>
          <div className="w-full">
              <div className="flex items-center gap-4 mb-6">
                <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} uppercase`}>
                  人格<span className="text-indigo-500">实例化</span>控制台
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
              </div>

              <form onSubmit={createCharacter} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} ml-1`}>身份代号</label>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value.slice(0, 40))}
                      placeholder="例如：御姐"
                      className={`w-full ${isDark ? 'bg-black/40 border-white/5 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus:border-indigo-500/50'} border rounded-2xl px-6 py-4 text-sm outline-none transition-all placeholder:text-slate-600 ${isDark ? 'text-white' : 'text-slate-900 shadow-inner'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} ml-1`}>初始频率 (开场白)</label>
                    <input
                      value={greeting}
                      onChange={(event) => setGreeting(event.target.value.slice(0, 500))}
                      placeholder="输入初始化语音..."
                      className={`w-full ${isDark ? 'bg-black/40 border-white/5 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus:border-indigo-500/50'} border rounded-2xl px-6 py-4 text-sm outline-none transition-all placeholder:text-slate-600 ${isDark ? 'text-white' : 'text-slate-900 shadow-inner'}`}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>核心协议内容 (Persona Protocol)</label>
                    <span className={`text-[9px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'} uppercase tracking-widest`}>
                      {persona.length} / 2000 字节已缓存
                    </span>
                  </div>
                  <div className="relative group/persona">
                    <textarea
                      value={persona}
                      onChange={(event) => setPersona(event.target.value.slice(0, 2000))}
                      placeholder="在此输入实体的核心人格逻辑、行为边界、知识框架以及对话风格协议..."
                      rows={6}
                      className={`w-full ${isDark ? 'bg-black/40 border-white/5 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus:border-indigo-500/50'} border rounded-[32px] px-8 py-8 text-base leading-relaxed outline-none transition-all resize-none placeholder:text-slate-600 ${isDark ? 'text-white' : 'text-slate-900 shadow-inner'}`}
                    />
                    <div className="absolute inset-0 rounded-[32px] border-2 border-indigo-500/0 group-focus-within/persona:border-indigo-500/10 pointer-events-none transition-all duration-500"></div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 pt-2">
                  <div className="flex-1 w-full">
                    {((persona.trim().length > 0 && persona.trim().length < 10) || showValidationHint) && (
                      <div className="flex items-center gap-3 py-3 px-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl animate-in fade-in slide-in-from-top-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></div>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">
                          人格协议强度不足：当前 {persona.trim().length}/10 字符
                        </p>
                      </div>
                    )}
                  </div>
                  <MovingBorderButton
                    type="submit"
                    disabled={creating}
                    borderRadius="1.5rem"
                    containerClassName={`h-16 w-full md:w-64 ${(!creating && persona.trim().length < 10) ? 'opacity-40' : ''}`}
                    className={`${isDark ? 'bg-indigo-600/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'} font-black text-xs uppercase tracking-widest text-indigo-500`}
                  >
                    {creating ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>同步中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        <span>同步实例化</span>
                      </div>
                    )}
                  </MovingBorderButton>
                </div>
              </form>
            </div>
          </div>
        </section>

      {/* Character Grid */}
      <section className="flex-1 min-h-[400px]">
        <div className="flex items-center justify-between mb-10 px-4">
          <h2 className={`text-xl font-black tracking-tight flex items-center gap-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <UserRound className="w-6 h-6 text-indigo-500" />
            已就绪的虚拟实体
          </h2>
          <span className={`px-4 py-1.5 ${isDark ? 'bg-white/5 text-indigo-400 border-white/5' : 'bg-slate-100 text-indigo-600 border-slate-200'} rounded-full text-xs font-black border tracking-widest`}>
            {characterList.length} NODES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {loading ? (
            Array.from({length: 4}).map((_, i) => (
              <div key={i} className={`h-64 rounded-[40px] animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
            ))
          ) : characterList.length > 0 ? (
            characterList.map((character) => (
              <motion.div
                key={character.id}
                whileHover={{ y: -8 }}
                className={`group relative p-8 rounded-[40px] border transition-all duration-500 flex flex-col justify-between cursor-pointer ${
                  isDark ? "bg-[#1C2026]/30 border-white/5 hover:bg-[#1C2026]/50 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50" : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10"
                }`}
                onClick={() => startConversation(character)}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 ${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded-2xl flex items-center justify-center border ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <Bot className="w-6 h-6 text-indigo-500" />
                    </div>
                    <button
                      onClick={(e) => deleteCharacter(character.id, e)}
                      disabled={deletingId === character.id}
                      className={`p-3 rounded-xl transition-all ${
                        isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"
                      } ${deletingId === character.id ? "opacity-50 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      {deletingId === character.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                  <h3 className={`text-2xl font-black mb-3 tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} uppercase`}>{character.name}</h3>
                  <p className={`text-xs font-bold leading-relaxed line-clamp-3 uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {character.persona}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">已就绪</span>
                   </div>
                   <ChevronRight className="w-5 h-5 text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className={`col-span-full py-20 text-center ${isDark ? 'bg-white/2 border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'} rounded-[48px] border border-dashed`}>
              <Bot className="w-16 h-16 mx-auto mb-6 opacity-20" />
              <p className="font-black uppercase tracking-[0.4em] text-xs">未检测到活跃的人格协议</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
