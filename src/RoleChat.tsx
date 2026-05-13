import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Activity,
  ArrowLeft,
  Bot,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  UserRound
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

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
  return data.error || `Unexpected API response (${status}): ${JSON.stringify(data).slice(0, 160)}`;
};

const messageText = (message: UIMessage) => {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => {
      return part.type === "text" && typeof (part as { text?: unknown }).text === "string";
    })
    .map((part) => part.text)
    .join("");
};

export default function RoleChat({ onNavigateHome }: RoleChatProps) {
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
      setError(err instanceof Error ? err.message : "Unable to load characters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

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
      setError(err instanceof Error ? err.message : "Unable to create character.");
    } finally {
      setCreating(false);
    }
  };

  const startConversation = async (character: Character) => {
    setStartingChat(true);
    setError(null);
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
      setError(err instanceof Error ? err.message : "Unable to start conversation.");
    } finally {
      setStartingChat(false);
    }
  };

  const deleteCharacter = async (character: Character) => {
    const confirmed = window.confirm(`Delete "${character.name}" and all of its conversations?`);
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
      setError(err instanceof Error ? err.message : "Unable to delete character.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <button onClick={onNavigateHome} className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase hidden sm:block">DotaPulse</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={loadCharacters}
              disabled={loading}
              className="p-3 bg-gray-50 border border-gray-100 text-gray-700 rounded-2xl hover:bg-white hover:border-gray-200 transition-all disabled:opacity-50"
              aria-label="Refresh characters"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onNavigateHome}
              className="px-4 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 xl:grid-cols-12 gap-8">
        <aside className="xl:col-span-4 space-y-8">
          <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 mb-2">Role Lab</p>
                <h1 className="text-3xl font-black tracking-tighter text-gray-900">Characters</h1>
              </div>
              <Bot className="w-8 h-8 text-gray-900" />
            </div>

            <form onSubmit={createCharacter} className="space-y-4">
              <input
                value={name}
                onChange={(event) => setName(event.target.value.slice(0, 40))}
                placeholder="Character name"
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
              <textarea
                value={persona}
                onChange={(event) => setPersona(event.target.value.slice(0, 2000))}
                placeholder="Persona, tone, boundaries, memory..."
                rows={7}
                className="w-full bg-gray-50 border border-transparent rounded-3xl px-4 py-4 text-sm outline-none focus:bg-white focus:border-blue-600 transition-all resize-none"
              />
              <textarea
                value={greeting}
                onChange={(event) => setGreeting(event.target.value.slice(0, 500))}
                placeholder="Optional opening message"
                rows={3}
                className="w-full bg-gray-50 border border-transparent rounded-3xl px-4 py-4 text-sm outline-none focus:bg-white focus:border-blue-600 transition-all resize-none"
              />
              <button
                type="submit"
                disabled={creating || persona.trim().length < 10}
                className="w-full px-5 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-blue-500 disabled:opacity-40 transition-all"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Character
              </button>
            </form>
          </section>

          <section className="bg-white rounded-[40px] border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 px-2">
              <h2 className="text-lg font-black tracking-tight">Saved Roles</h2>
              <span className="text-xs font-black text-gray-400">{characters.length}</span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
              </div>
            ) : characters.length > 0 ? (
              <div className="space-y-3">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className={`w-full text-left p-5 rounded-[28px] border transition-all ${
                      selectedCharacter?.id === character.id
                        ? "bg-blue-50 border-blue-100"
                        : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <button
                        onClick={() => startConversation(character)}
                        disabled={startingChat || deletingId === character.id}
                        className="min-w-0 flex-1 text-left disabled:opacity-50"
                      >
                        <p className="font-black text-gray-900 tracking-tight truncate">{character.name}</p>
                        <p className="text-xs text-gray-500 mt-2 leading-5 line-clamp-2">{character.persona}</p>
                      </button>
                      <div className="min-w-0">
                        <button
                          onClick={() => deleteCharacter(character)}
                          disabled={deletingId === character.id}
                          className="w-10 h-10 rounded-2xl bg-white border border-gray-100 text-gray-400 flex items-center justify-center hover:text-red-600 hover:border-red-100 transition-all disabled:opacity-50"
                          aria-label={`Delete ${character.name}`}
                        >
                          {deletingId === character.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-[28px] border border-dashed border-gray-200">
                <p className="text-sm font-bold text-gray-400">No characters yet.</p>
              </div>
            )}
          </section>
        </aside>

        <section className="xl:col-span-8 bg-white rounded-[48px] border border-gray-100 shadow-sm min-h-[760px] flex flex-col overflow-hidden">
          <div className="p-8 md:p-10 border-b border-gray-100 flex items-start justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 mb-3">
                {selectedCharacter ? "Active Role" : "No Role Selected"}
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900">
                {selectedCharacter?.name || "Create or select a character"}
              </h2>
              <p className="text-sm text-gray-500 leading-6 mt-3 max-w-2xl line-clamp-2">
                {selectedCharacter?.persona || "Set a persona, start a conversation, and stream replies from Workers AI."}
              </p>
            </div>
            <div className="w-14 h-14 bg-gray-900 rounded-3xl flex items-center justify-center shrink-0">
              <Sparkles className="w-7 h-7 text-yellow-300" />
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-6 bg-red-50 border border-red-100 text-red-700 rounded-3xl px-5 py-4 text-sm font-bold">
              {error}
            </div>
          )}

          <ConversationPanel
            key={conversation?.id || "empty"}
            conversation={conversation}
            initialMessages={initialMessages}
            characterName={selectedCharacter?.name}
          />
        </section>
      </main>
    </div>
  );
}

function ConversationPanel({
  conversation,
  initialMessages,
  characterName
}: {
  conversation: Conversation | null;
  initialMessages: UIMessage[];
  characterName?: string;
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

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || !conversation || isStreaming) return;

    setInput("");
    await sendMessage({ text });
  };

  return (
    <>
      {chatError && (
        <div className="mx-8 mt-6 bg-red-50 border border-red-100 text-red-700 rounded-3xl px-5 py-4 text-sm font-bold">
          {chatError.message}
        </div>
      )}

      <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-5">
        {messages.length > 0 ? (
          <>
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div key={message.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-[28px] px-5 py-4 text-sm leading-7 break-words ${
                    isUser ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700 border border-gray-100"
                  }`}>
                    {messageText(message)}
                  </div>
                  {isUser && (
                    <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                      <UserRound className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>
              );
            })}
            {showThinking && (
              <div className="flex gap-3 justify-start">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-[78%] rounded-[28px] px-5 py-4 text-sm leading-7 bg-gray-50 text-gray-500 border border-gray-100 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{characterName || "角色"} 正在想...</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full min-h-[420px] flex items-center justify-center text-center">
            <div className="max-w-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-gray-400 leading-6">
                Select a saved role to open a fresh conversation.
              </p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={submitMessage} className="p-6 md:p-8 border-t border-gray-100 flex items-end gap-4">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={conversation ? "Message the character..." : "Select a character first"}
          disabled={!conversation || isStreaming}
          rows={2}
          className="flex-1 bg-gray-50 border border-transparent rounded-3xl px-5 py-4 text-sm outline-none focus:bg-white focus:border-blue-600 transition-all resize-none disabled:opacity-50"
        />
        <button
          type={isStreaming ? "button" : "submit"}
          onClick={isStreaming ? () => void stop() : undefined}
          disabled={!conversation || (!isStreaming && input.trim().length < 1)}
          className="h-14 px-6 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-blue-500 disabled:opacity-40 transition-all"
        >
          {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          <span className="hidden sm:inline">{isStreaming ? "Stop" : "Send"}</span>
        </button>
      </form>
    </>
  );
}
