import { type UIMessage } from "ai";
import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { RoleChatHome } from "./components/role-chat/RoleChatHome";
import { RoleChatDialogue } from "./components/role-chat/RoleChatDialogue";
import { apiPath, type Character, type Conversation, type ConversationResponse, type CharactersResponse, type CharacterResponse } from "./components/role-chat/types";

type RoleChatProps = {
  onNavigateHome: () => void;
  onNavigateGuestbook: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  initialCharacterId?: string;
};

export default function RoleChat({ 
  isDark, 
  toggleTheme, 
  initialCharacterId, 
  onNavigateHome, 
  onNavigateGuestbook 
}: RoleChatProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkingCharacterId, setLinkingCharacterId] = useState<string | null>(null);
  const [showValidationHint, setShowValidationHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeConversationRequest = useRef(0);

  // Form State
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [greeting, setGreeting] = useState("");

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiPath("/api/characters"));
      const data = await response.json() as CharactersResponse;
      setCharacters(data.characters || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load entities");
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
      if (char && selectedCharacter?.id !== char.id) {
        startConversation(char);
      }
    }
  }, [initialCharacterId, characters, selectedCharacter?.id]);

  const createCharacter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (persona.trim().length < 10) {
      setShowValidationHint(true);
      return;
    }
    if (creating) return;
    setCreating(true);
    setError(null);
    setShowValidationHint(false);
    try {
      const response = await fetch(apiPath("/api/characters"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, persona, greeting }),
      });
      const data = await response.json() as CharacterResponse;
      if (data.character) {
        setCharacters([data.character, ...characters]);
        setName("");
        setPersona("");
        setGreeting("");
      }
    } catch (err) {
      console.error(err);
      setError("Sync failed");
    } finally {
      setCreating(false);
    }
  };

  const deleteCharacter = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (deletingId) return;
    const character = characters.find((item) => item.id === id);
    const confirmed = window.confirm(`确认删除「${character?.name || "这个角色"}」吗？相关对话记录也会一起删除。`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await fetch(apiPath(`/api/characters/${id}`), { method: "DELETE" });
      setCharacters(characters.filter(c => c.id !== id));
      if (selectedCharacter?.id === id) {
        activeConversationRequest.current += 1;
        setSelectedCharacter(null);
        setConversation(null);
        setInitialMessages([]);
        setLinkingCharacterId(null);
        window.history.pushState(null, "", "/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const startConversation = async (character: Character) => {
    const requestId = activeConversationRequest.current + 1;
    activeConversationRequest.current = requestId;
    setSelectedCharacter(character);
    setConversation(null);
    setInitialMessages([]);
    setLinkingCharacterId(character.id);
    setError(null);
    window.history.pushState(null, "", `/chat/${character.id}`);
    try {
      const existingResponse = await fetch(apiPath(`/api/characters/${character.id}/conversation`));
      const existingData = await existingResponse.json() as ConversationResponse;
      if (activeConversationRequest.current !== requestId) return;
      
      if (existingData.conversation) {
        setConversation(existingData.conversation);
        setInitialMessages(existingData.messages || []);
      } else {
        const createResponse = await fetch(apiPath("/api/chats"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ characterId: character.id }),
        });
        const createData = await createResponse.json() as ConversationResponse;
        if (activeConversationRequest.current !== requestId) return;
        if (createData.conversation) {
          setConversation(createData.conversation);
          setInitialMessages(createData.messages || []);
        }
      }
    } catch (err) {
      console.error(err);
      if (activeConversationRequest.current !== requestId) return;
      setError("Neural link failed");
    } finally {
      if (activeConversationRequest.current === requestId) {
        setLinkingCharacterId(null);
      }
    }
  };

  const isBootstrapping = initialCharacterId && loading && !selectedCharacter;

  return (
    <div className="relative min-h-screen w-full max-w-[1800px] mx-auto flex flex-col px-4 sm:px-6 pt-8 md:pt-14 pb-8">
      <AnimatePresence mode="wait">
        {isBootstrapping ? (
          <motion.div
            key="bootstrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className={`w-16 h-16 border-4 ${isDark ? 'border-white/5' : 'border-slate-100'} rounded-full`}></div>
              <div className="w-16 h-16 border-4 border-t-indigo-500 rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">正在初始化神经链路...</p>
          </motion.div>
        ) : !selectedCharacter ? (
          <RoleChatHome
            key="home"
            isDark={isDark}
            name={name} setName={setName}
            greeting={greeting} setGreeting={setGreeting}
            persona={persona} setPersona={setPersona}
            creating={creating}
            createCharacter={createCharacter}
            showValidationHint={showValidationHint}
            loading={loading}
            characterList={characters}
            deletingId={deletingId}
            deleteCharacter={deleteCharacter}
            startConversation={startConversation}
            characters={characters.length > 0}
          />
        ) : (
          <RoleChatDialogue
            key={`${selectedCharacter.id}:${conversation?.id || "linking"}`}
            selectedCharacter={selectedCharacter}
            conversation={conversation}
            initialMessages={initialMessages}
            isLinking={linkingCharacterId === selectedCharacter.id}
            isDark={isDark}
            toggleTheme={toggleTheme}
            onBack={() => {
              activeConversationRequest.current += 1;
              setSelectedCharacter(null);
              setConversation(null);
              setInitialMessages([]);
              setLinkingCharacterId(null);
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                window.history.pushState(null, "", "/");
              }
            }}
          />
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-red-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce">
          {error}
        </div>
      )}
    </div>
  );
}
