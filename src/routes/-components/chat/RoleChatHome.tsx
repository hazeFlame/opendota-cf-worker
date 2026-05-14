import React from "react";
import { motion } from "motion/react";
import { Bot, Sparkles, Loader2, UserRound, Trash2, ChevronRight, Lock, Globe2 } from "lucide-react";
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
  visibility: Character["visibility"];
  setVisibility: (v: Character["visibility"]) => void;
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
  visibility, setVisibility,
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
      className="h-full flex flex-col lg:grid lg:grid-cols-12 gap-10 overflow-y-auto pr-2 custom-scrollbar"
    >
      {/* Sidebar: Character Creation Console */}
      <aside className="lg:col-span-4 2xl:col-span-3 space-y-6">
        <div className="relative group">
          <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[32px] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200`}></div>
          <div className={`relative px-6 py-8 ${isDark ? 'bg-[#16191F]/80 border-white/10' : 'bg-white/80 border-slate-200'} backdrop-blur-3xl rounded-[32px] border transition-all duration-500`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-lg font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} uppercase leading-none`}>
                人格<span className="text-indigo-500">实例化</span>
              </h2>
            </div>

            <form onSubmit={createCharacter} className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} ml-1`}>身份代号</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value.slice(0, 40))}
                    placeholder="例如：御姐"
                    className={`w-full ${isDark ? 'bg-black/40 border-white/5 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus:border-indigo-500/50'} border rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-600 ${isDark ? 'text-white' : 'text-slate-900 shadow-inner'}`}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} ml-1`}>开场白</label>
                  <input
                    value={greeting}
                    onChange={(event) => setGreeting(event.target.value.slice(0, 500))}
                    placeholder="输入初始化语音..."
                    className={`w-full ${isDark ? 'bg-black/40 border-white/5 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus:border-indigo-500/50'} border rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-600 ${isDark ? 'text-white' : 'text-slate-900 shadow-inner'}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>核心协议内容</label>
                    <span className={`text-[9px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'} uppercase tracking-widest`}>
                      {persona.length} B
                    </span>
                  </div>
                  <textarea
                    value={persona}
                    onChange={(event) => setPersona(event.target.value.slice(0, 2000))}
                    placeholder="输入实体的核心人格逻辑..."
                    rows={8}
                    className={`w-full ${isDark ? 'bg-black/40 border-white/5 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus:border-indigo-500/50'} border rounded-2xl px-5 py-5 text-sm leading-relaxed outline-none transition-all resize-none placeholder:text-slate-600 ${isDark ? 'text-white' : 'text-slate-900 shadow-inner'}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} ml-1`}>可见性</label>
                  <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    {[
                      { value: "private" as const, label: "私有", icon: Lock },
                      { value: "public" as const, label: "公开", icon: Globe2 },
                    ].map((option) => {
                      const Icon = option.icon;
                      const active = visibility === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setVisibility(option.value)}
                          className={`h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            active
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                              : isDark
                                ? "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                                : "text-slate-500 hover:bg-white hover:text-slate-900"
                          }`}
                          title={option.value === "public" ? "公开后其他登录用户可以看到并发起自己的对话" : "只有你能看到和使用"}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {((persona.trim().length > 0 && persona.trim().length < 10) || showValidationHint) && (
                <div className="flex items-center gap-2 py-2 px-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></div>
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                    协议强度不足 ({persona.trim().length}/10)
                  </p>
                </div>
              )}

              <MovingBorderButton
                type="submit"
                disabled={creating}
                borderRadius="1rem"
                containerClassName={`h-14 w-full ${(!creating && persona.trim().length < 10) ? 'opacity-40' : ''}`}
                className={`${isDark ? 'bg-indigo-600/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'} font-black text-[10px] uppercase tracking-widest text-indigo-500`}
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>同步实例化</span>}
              </MovingBorderButton>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content: Character Grid */}
      <main className="lg:col-span-8 2xl:col-span-9 space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
             <div className={`w-10 h-10 ${isDark ? 'bg-white/5' : 'bg-slate-100'} rounded-xl flex items-center justify-center border ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <UserRound className="w-5 h-5 text-indigo-500" />
             </div>
             <h2 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} uppercase`}>
               已就绪的人格节点
             </h2>
          </div>
          <div className={`px-4 py-1.5 ${isDark ? 'bg-white/5 text-slate-500 border-white/5' : 'bg-white text-slate-400 border-slate-200'} rounded-full text-[10px] font-black border tracking-[0.2em] uppercase`}>
            {characterList.length} Nodes Active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({length: 6}).map((_, i) => (
              <div key={i} className={`h-64 rounded-[32px] animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
            ))
          ) : characterList.length > 0 ? (
            characterList.map((character) => (
              <motion.div
                key={character.id}
                whileHover={{ y: -5, scale: 1.01 }}
                className={`group relative p-8 rounded-[32px] border transition-all duration-500 flex flex-col justify-between cursor-pointer ${
                  isDark ? "bg-[#1C2026]/40 border-white/5 hover:bg-[#1C2026]/60 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50" : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5"
                }`}
                onClick={() => startConversation(character)}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-10 h-10 ${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded-xl flex items-center justify-center border ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <Bot className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        character.visibility === "public"
                          ? isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : isDark ? "bg-white/5 text-slate-500 border-white/5" : "bg-slate-50 text-slate-500 border-slate-100"
                      }`}>
                        {character.visibility === "public" ? "公开" : "私有"}
                      </span>
                      {character.isOwner && (
                        <button
                          onClick={(e) => deleteCharacter(character.id, e)}
                          disabled={deletingId === character.id}
                          className={`p-2.5 rounded-lg transition-all ${
                            isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"
                          } ${deletingId === character.id ? "opacity-50" : "opacity-0 group-hover:opacity-100"}`}
                          title="删除角色卡和关联对话"
                        >
                          {deletingId === character.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className={`text-xl font-black mb-2 tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} uppercase`}>{character.name}</h3>
                  {!character.isOwner && character.ownerName && (
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      来自 {character.ownerName}
                    </p>
                  )}
                  <p className={`text-[11px] font-medium leading-relaxed line-clamp-4 tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {character.persona}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-dashed border-slate-500/10 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Node Ready</span>
                   </div>
                   <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'} flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all`}>
                      <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className={`col-span-full py-24 text-center ${isDark ? 'bg-white/2 border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'} rounded-[32px] border border-dashed`}>
              <Bot className="w-12 h-12 mx-auto mb-6 opacity-10" />
              <p className="font-black uppercase tracking-[0.3em] text-[10px]">未检测到活跃的人格协议</p>
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
}
