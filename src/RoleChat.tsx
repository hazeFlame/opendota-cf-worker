import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Activity,
  ArrowLeft,
  Bot,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  Sun,
  Moon,
  ChevronRight,
  History as HistoryIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useMemo, useState } from "react";
import { BackgroundBeams } from "./components/ui/background-beams";
import { Button as MovingBorderButton } from "./components/ui/moving-border";

type Character = {
  id: string;
  name: string;
  persona: string;
  greeting: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  characterId: string;
  title: string;
  createdAt: string;
};
type RoleChatProps = {
  onNavigateHome: () => void;
  onNavigateGuestbook: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  initialCharacterId?: string;
};

type CharactersResponse = {
  characters?: Character[];
  error?: string;
};

type CharacterResponse = {
  character?: Character;
  error?: string;
};

type ConversationResponse = {
  character?: Character;
  conversation?: Conversation | null;
  messages?: UIMessage[];
  error?: string;
};

const apiPath = (path: string) => `${import.meta.env.VITE_GUESTBOOK_API_BASE || ""}${path}`;

const responseError = (data: { error?: string }, status: number) => {
  return data.error || `意外的 API 响应 (${status}): ${JSON.stringify(data).slice(0, 160)}`;
};

const messageText = (message: UIMessage) => {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => {
      return part.type === "text" && typeof (part as { text?: unknown }).text === "string";
    })
    .map((part) => part.text)
    .join("");
};

export default function RoleChat({ onNavigateHome, onNavigateGuestbook, isDark, toggleTheme, initialCharacterId }: RoleChatProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCharacters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiPath("/api/characters"));
      const data = await response.json() as CharactersResponse;
      if (!response.ok) throw new Error(responseError(data, response.status));
      setCharacters(data.characters ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法加载角色列表。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    if (initialCharacterId && characters.length > 0) {
      const char = characters.find(c => c.id === initialCharacterId);
      if (char) {
        startConversation(char);
      }
    }
  }, [initialCharacterId, characters]);

  const createCharacter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (creating) return;

    setCreating(true);
    setError(null);
    try {
      const response = await fetch(apiPath("/api/characters"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, persona, greeting })
      });
      const data = await response.json() as CharacterResponse;
      if (!response.ok || !data.character) {
        throw new Error(responseError(data, response.status));
      }

      setCharacters((current) => [data.character as Character, ...current]);
      setSelectedCharacter(data.character);
      setName("");
      setPersona("");
      setGreeting("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法创建角色。");
    } finally {
      setCreating(false);
    }
  };

  const startConversation = async (character: Character) => {
    setSelectedCharacter(character);
    setStartingChat(true);
    setError(null);
    window.history.pushState(null, "", `/chat/${character.id}`);
    try {
      const existingResponse = await fetch(apiPath(`/api/characters/${character.id}/conversation`));
      const existingData = await existingResponse.json() as ConversationResponse;
      if (!existingResponse.ok) {
        throw new Error(responseError(existingData, existingResponse.status));
      }

      if (existingData.conversation) {
        setSelectedCharacter(character);
        setConversation(existingData.conversation);
        setInitialMessages(existingData.messages ?? []);
        return;
      }

      const response = await fetch(apiPath("/api/chats"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ characterId: character.id })
      });
      const data = await response.json() as ConversationResponse;
      if (!response.ok || !data.conversation) {
        throw new Error(responseError(data, response.status));
      }

      setSelectedCharacter(character);
      setConversation(data.conversation);
      if (character.greeting) {
        setInitialMessages([{
          id: `greeting-${data.conversation.id}`,
          role: "assistant",
          parts: [{ type: "text", text: character.greeting }]
        }]);
      } else {
        setInitialMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法开启对话。");
    } finally {
      setStartingChat(false);
    }
  };

  const deleteCharacter = async (character: Character) => {
    const confirmed = window.confirm(`确定要删除 "${character.name}" 及其所有对话记录吗？`);
    if (!confirmed || deletingId) return;

    setDeletingId(character.id);
    setError(null);
    try {
      const response = await fetch(apiPath(`/api/characters/${character.id}`), {
        method: "DELETE"
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        throw new Error(responseError(data, response.status));
      }

      setCharacters((current) => current.filter((item) => item.id !== character.id));
      if (selectedCharacter?.id === character.id) {
        setSelectedCharacter(null);
        setConversation(null);
        setInitialMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法删除角色。");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0F1115] text-gray-100' : 'bg-[#F8FAFC] text-slate-900'} font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden flex flex-col transition-colors duration-500`}>
      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/5'} blur-[120px]`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'} blur-[120px]`}></div>
        <BackgroundBeams className="opacity-40" />
      </div>

      <nav className={`relative z-50 ${isDark ? 'bg-[#16191F]/80 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-2xl border-b transition-colors duration-500`}>
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <button onClick={() => window.location.href = "/"} className="flex items-center gap-4 shrink-0 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform group-hover:rotate-6 transition-all duration-500">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className={`font-black text-xl tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>RoleChat</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mt-1">智能实验室</span>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-3 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-2xl transition-all active:scale-95`}
              aria-label="切换主题"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onNavigateGuestbook}
              className={`px-5 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">留言板</span>
            </button>
            <button
              onClick={loadCharacters}
              disabled={loading}
              className={`p-3 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-2xl transition-all disabled:opacity-50`}
              aria-label="刷新角色"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedCharacter ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col gap-12 overflow-y-auto pr-2 custom-scrollbar"
            >
              {/* Create Character Hero */}
              <section className={`${isDark ? 'bg-[#1C2026]/50 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} backdrop-blur-xl rounded-[48px] border p-10 md:p-16 transition-colors duration-500`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                  <div className="max-w-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-4">人格创造实验室</p>
                    <h2 className={`text-4xl md:text-6xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} mb-6 uppercase leading-none`}>
                      创造属于你的 <br/><span className="text-indigo-500">虚拟人格</span>
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                      在这里定义独特的灵魂。无论是博学的导师、机智的伙伴还是神秘的向导，只需几步，即可赋予他们生命。
                    </p>
                    
                    <form onSubmit={createCharacter} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">身份名称</label>
                        <input
                          value={name}
                          onChange={(event) => setName(event.target.value.slice(0, 40))}
                          placeholder="例如：御姐"
                          className={`w-full ${isDark ? 'bg-black/20 border-white/5 focus:bg-black/40' : 'bg-slate-50 border-slate-200 focus:bg-white'} border rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 ${isDark ? 'text-white' : 'text-slate-900'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">开场白 (可选)</label>
                        <input
                          value={greeting}
                          onChange={(event) => setGreeting(event.target.value.slice(0, 500))}
                          placeholder="他们对你说的第一句话..."
                          className={`w-full ${isDark ? 'bg-black/20 border-white/5 focus:bg-black/40' : 'bg-slate-50 border-slate-200 focus:bg-white'} border rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 ${isDark ? 'text-white' : 'text-slate-900'}`}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">核心人格 (Persona)</label>
                        <textarea
                          value={persona}
                          onChange={(event) => setPersona(event.target.value.slice(0, 2000))}
                          placeholder="定义角色的身份、语气、行为边界和知识背景..."
                          rows={3}
                          className={`w-full ${isDark ? 'bg-black/20 border-white/5 focus:bg-black/40' : 'bg-slate-50 border-slate-200 focus:bg-white'} border rounded-[24px] px-5 py-5 text-sm outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-400 ${isDark ? 'text-white' : 'text-slate-900'}`}
                        />
                      </div>
                      <MovingBorderButton
                        type="submit"
                        disabled={creating || persona.trim().length < 10}
                        borderRadius="1rem"
                        containerClassName="md:col-span-2 w-full mt-4"
                        className={`${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200'} font-black text-sm uppercase tracking-widest text-indigo-500 h-16`}
                      >
                        {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        <span className="ml-2">实例化实体</span>
                      </MovingBorderButton>
                    </form>
                  </div>
                  
                  <div className={`hidden lg:flex w-64 h-64 ${isDark ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} rounded-[64px] border items-center justify-center relative shadow-inner`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-[64px] animate-pulse"></div>
                    <Bot className="w-32 h-32 text-indigo-500 drop-shadow-2xl" />
                  </div>
                </div>
              </section>

              {/* Character Grid */}
              <section className="flex-1 min-h-[400px]">
                <div className="flex items-center justify-between mb-10 px-4">
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-4">
                    <UserRound className="w-6 h-6 text-indigo-500" />
                    已就绪的虚拟实体
                  </h2>
                  <span className={`px-4 py-1.5 ${isDark ? 'bg-white/5 text-indigo-400 border-white/5' : 'bg-slate-100 text-indigo-600 border-slate-200'} rounded-full text-xs font-black border tracking-widest`}>
                    {characters.length} NODES
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {loading ? (
                    Array.from({length: 4}).map((_, i) => (
                      <div key={i} className={`h-64 rounded-[40px] animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                    ))
                  ) : characters.length > 0 ? (
                    characters.map((character) => (
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
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCharacter(character);
                              }}
                              disabled={deletingId === character.id}
                              className={`w-10 h-10 rounded-xl ${isDark ? 'bg-black/20 border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'} border flex items-center justify-center hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0`}
                            >
                              {deletingId === character.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                          <h3 className={`font-black text-2xl tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {character.name}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'} leading-relaxed line-clamp-3 font-medium`}>
                            {character.persona}
                          </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-dashed border-slate-500/20 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">连接可用</span>
                          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className={`col-span-full py-40 text-center rounded-[48px] border-2 border-dashed ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">当前虚空中无活跃实体</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex bg-black overflow-hidden"
            >
              {/* Minimalist Side Bar */}
              <aside className={`w-[80px] md:w-[100px] h-full flex flex-col items-center py-10 border-r ${isDark ? 'bg-[#0F1115] border-white/5' : 'bg-white border-slate-200'} transition-colors duration-500 shrink-0`}>
                <button 
                  onClick={() => {
                    setSelectedCharacter(null);
                    setConversation(null);
                    window.history.pushState(null, "", "/");
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'} transition-all mb-12`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 flex flex-col items-center gap-8">
                  <div className={`w-14 h-14 md:w-16 md:h-16 ${isDark ? 'bg-indigo-600/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100 shadow-sm'} rounded-3xl flex items-center justify-center border relative group`}>
                    <Bot className="w-8 h-8 text-indigo-500" />
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {selectedCharacter.name}
                    </div>
                  </div>

                  <div className="w-px h-20 bg-gradient-to-b from-indigo-500/50 to-transparent"></div>
                  
                  <div className="flex flex-col gap-6">
                     <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-colors">
                        <Activity className="w-5 h-5" />
                     </button>
                     <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-colors">
                        <HistoryIcon className="w-5 h-5" />
                     </button>
                  </div>
                </div>

                <button 
                  onClick={toggleTheme}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5 text-yellow-400' : 'bg-slate-100 text-slate-500'} border ${isDark ? 'border-white/5' : 'border-slate-200'} transition-all mt-auto`}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </aside>

              {/* Main Dialogue Content */}
              <div className="flex-1 flex flex-col h-full min-w-0">
                <header className={`h-20 px-8 flex items-center justify-between border-b ${isDark ? 'bg-[#16191F] border-white/5' : 'bg-white border-slate-200'} transition-colors duration-500`}>
                  <div className="flex items-center gap-6 min-w-0">
                    <h2 className={`text-xl md:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} truncate uppercase`}>
                      {selectedCharacter.name}
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-500">连接中</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-500">
                      性格模组: {selectedCharacter.persona.slice(0, 30)}...
                    </p>
                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'} border flex items-center justify-center`}>
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                    </div>
                  </div>
                </header>

                <div className={`flex-1 overflow-hidden flex flex-col ${isDark ? 'bg-[#0F1115]' : 'bg-[#F8FAFC]'}`}>
                  <ConversationPanel
                    key={conversation?.id || "empty"}
                    conversation={conversation}
                    initialMessages={initialMessages}
                    characterName={selectedCharacter?.name}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Persona Detail (Floating or Overlay if mobile, Side for desktop) */}
              <div className={`hidden 2xl:flex w-[400px] h-full flex-col p-10 border-l ${isDark ? 'bg-[#16191F] border-white/5' : 'bg-white border-slate-200'} transition-colors duration-500 overflow-y-auto custom-scrollbar`}>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6">实体底层协议</p>
                 <div className={`p-8 rounded-[32px] ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100 shadow-inner'} border text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium mb-10`}>
                    {selectedCharacter.persona}
                 </div>
                 
                 {selectedCharacter.greeting && (
                   <>
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">核心触发响应</p>
                     <p className={`text-lg italic font-bold tracking-tight ${isDark ? 'text-gray-300' : 'text-slate-700'} pl-6 border-l-4 border-indigo-500/30`}>
                       "{selectedCharacter.greeting}"
                     </p>
                   </>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}; }
      ` }} />
    </div>
  );
}

function ConversationPanel({
  conversation,
  initialMessages,
  characterName,
  isDark
}: {
  conversation: Conversation | null;
  initialMessages: UIMessage[];
  characterName?: string;
  isDark: boolean;
}) {
  const [input, setInput] = useState("");
  const transport = useMemo(() => {
    const api = conversation
      ? apiPath(`/api/chats/${conversation.id}/messages`)
      : apiPath("/api/chats/pending/messages");
    return new DefaultChatTransport({ api });
  }, [conversation?.id]);

  const { messages, sendMessage, status, stop, error: chatError } = useChat({
    transport,
    messages: initialMessages
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
    if (!text || !conversation || isStreaming) return;

    setInput("");
    await sendMessage({ text });
  };

  return (
    <>
      <div 
        ref={scrollRef}
        className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8 custom-scrollbar scroll-smooth"
      >
        {messages.length > 0 ? (
          <>
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div key={message.id} className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-[24px] px-6 py-5 text-sm leading-7 transition-all ${
                    isUser 
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-500/10 font-medium" 
                      : (isDark ? "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none font-medium" : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none font-medium")
                  }`}>
                    {messageText(message)}
                  </div>
                  {isUser && (
                    <div className={`w-10 h-10 ${isDark ? 'bg-white/10 border-white/10 text-indigo-400' : 'bg-slate-100 border-slate-200 text-slate-500'} rounded-xl flex items-center justify-center shrink-0 border`}>
                      <UserRound className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
            {showThinking && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className={`max-w-[80%] rounded-[24px] px-6 py-5 text-sm leading-7 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} text-indigo-500 border rounded-tl-none flex items-center gap-4 font-black uppercase tracking-widest text-[10px]`}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{characterName || "角色"} 正在同步思考...</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12">
            <div className={`w-24 h-24 ${isDark ? 'bg-white/2 border-white/5' : 'bg-slate-50 border-slate-200'} rounded-[40px] flex items-center justify-center mb-8 border group shadow-inner`}>
              <Bot className={`w-12 h-12 ${isDark ? 'text-gray-700' : 'text-slate-300'} group-hover:text-indigo-500 transition-colors duration-500`} />
            </div>
            <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>无活跃神经链接</h3>
            <p className="text-sm font-bold text-slate-500 max-w-sm uppercase tracking-widest leading-relaxed">
              请从侧边栏选择一个身份开始认知同步。
            </p>
          </div>
        )}
      </div>

      {chatError && (
        <div className="mx-8 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em]">
          连接错误: {chatError.message}
        </div>
      )}

      <div className={`p-8 md:p-12 ${isDark ? 'bg-[#1C2026]/40 border-white/5' : 'bg-slate-50/80 border-slate-100'} border-t transition-colors duration-500`}>
        <form onSubmit={submitMessage} className="relative group">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={conversation ? "将思维传输给实体..." : "请先建立身份链接"}
            disabled={!conversation || isStreaming}
            rows={2}
            className={`w-full ${isDark ? 'bg-black/40 border-white/5 focus:bg-black/60 focus:border-indigo-500/40' : 'bg-white border-slate-200 focus:bg-white focus:border-indigo-400 shadow-lg shadow-slate-200/20'} border rounded-[32px] pl-7 pr-32 py-6 text-sm outline-none transition-all resize-none disabled:opacity-30 ${isDark ? 'text-white placeholder:text-gray-700 shadow-inner' : 'text-slate-900 placeholder:text-slate-300'}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitMessage(e as any);
              }
            }}
          />
          <div className="absolute right-4 bottom-4 top-4 flex items-center">
            <button
              type={isStreaming ? "button" : "submit"}
              onClick={isStreaming ? () => void stop() : undefined}
              disabled={!conversation || (!isStreaming && input.trim().length < 1)}
              className={`h-full px-8 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-[0.98] ${
                isStreaming 
                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" 
                : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:opacity-0"
              }`}
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isStreaming ? "中止" : "传输"}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
