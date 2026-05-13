import { type UIMessage } from "ai";
import { AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { BackgroundBeams } from "./components/ui/background-beams";
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

export default function RoleChat({ isDark, toggleTheme, initialCharacterId }: RoleChatProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showValidationHint, setShowValidationHint] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (char) {
        startConversation(char);
      }
    }
  }, [initialCharacterId, characters]);

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
    setDeletingId(id);
    try {
      await fetch(apiPath(`/api/characters/${id}`), { method: "DELETE" });
      setCharacters(characters.filter(c => c.id !== id));
      if (selectedCharacter?.id === id) {
        setSelectedCharacter(null);
        setConversation(null);
        window.history.pushState(null, "", "/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const startConversation = async (character: Character) => {
    setSelectedCharacter(character);
    setError(null);
    window.history.pushState(null, "", `/chat/${character.id}`);
    try {
      const existingResponse = await fetch(apiPath(`/api/characters/${character.id}/conversation`));
      const existingData = await existingResponse.json() as ConversationResponse;
      
      if (existingData.conversation) {
        setConversation(existingData.conversation);
        setInitialMessages(existingData.messages || []);
      } else {
        const createResponse = await fetch(apiPath(`/api/characters/${character.id}/conversation`), {
          method: "POST",
        });
        const createData = await createResponse.json() as ConversationResponse;
        if (createData.conversation) {
          setConversation(createData.conversation);
          setInitialMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Neural link failed");
    }
  };

  return (
    <div className="relative h-full w-full max-w-[1800px] mx-auto flex flex-col pt-12 md:pt-20">
      <AnimatePresence mode="wait">
        {!selectedCharacter ? (
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
            key="chat"
            selectedCharacter={selectedCharacter}
            conversation={conversation}
            initialMessages={initialMessages}
            isDark={isDark}
            toggleTheme={toggleTheme}
            onBack={() => {
              setSelectedCharacter(null);
              setConversation(null);
              window.history.pushState(null, "", "/");
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
