import React from "react";
import { motion } from "motion/react";
import { Bot, ArrowLeft, Activity, Sun, Moon, Sparkles } from "lucide-react";
import { History as HistoryIcon } from "lucide-react";
import { ConversationPanel } from "./ConversationPanel";
import { type Character, type Conversation } from "./types";
import { type UIMessage } from "ai";

type RoleChatDialogueProps = {
  selectedCharacter: Character;
  conversation: Conversation | null;
  initialMessages: UIMessage[];
  isLinking: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  onBack: () => void;
};

export function RoleChatDialogue({
  selectedCharacter,
  conversation,
  initialMessages,
  isLinking,
  isDark,
  toggleTheme,
  onBack
}: RoleChatDialogueProps) {
  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex bg-black overflow-hidden"
    >
      {/* Minimalist Side Bar */}
      <aside className={`w-[72px] md:w-[96px] h-full flex flex-col items-center py-6 md:py-8 border-r ${isDark ? 'bg-[#0F1115] border-white/5' : 'bg-white border-slate-200'} transition-colors duration-500 shrink-0`}>
        {/* Logo */}
        <div 
          className="mb-10 cursor-pointer group/logo"
          onClick={onBack}
        >
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>

        <button 
          onClick={onBack}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'} transition-all mb-8`}
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
        <header className={`min-h-20 px-4 md:px-8 py-4 flex items-center justify-between gap-4 border-b ${isDark ? 'bg-[#16191F] border-white/5' : 'bg-white border-slate-200'} transition-colors duration-500`}>
          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            <h2 className={`text-xl md:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} truncate uppercase`}>
              {selectedCharacter.name}
            </h2>
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border ${isLinking ? 'bg-amber-500/10 border-amber-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLinking ? 'bg-amber-500' : 'bg-green-500'}`}></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isLinking ? 'text-amber-500' : 'text-green-500'}`}>
                {isLinking ? "建立连接" : "已连接"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 min-w-0">
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
            isLinking={isLinking}
            isDark={isDark}
          />
        </div>
      </div>

      {/* Persona Detail (Floating or Overlay if mobile, Side for desktop) */}
      <div className={`hidden 2xl:flex w-[400px] h-full flex-col p-10 border-l ${isDark ? 'bg-[#16191F] border-white/5' : 'bg-white border-slate-200'} transition-colors duration-300 overflow-y-auto custom-scrollbar`}>
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6">实体底层协议</p>
         <div className={`p-8 rounded-[32px] ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'} border text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium mb-10`}>
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
  );
}
