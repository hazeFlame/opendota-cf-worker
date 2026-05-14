import { type UIMessage } from "ai";

export type Character = {
  id: string;
  name: string;
  persona: string;
  greeting?: string;
  createdAt: string;
  visibility: "private" | "public";
  isOwner: boolean;
  ownerName?: string;
};

export type Conversation = {
  id: string;
  characterId: string;
  title: string;
  createdAt: string;
};

export type CharactersResponse = {
  characters?: Character[];
  error?: string;
};

export type CharacterResponse = {
  character?: Character;
  error?: string;
};

export type ConversationResponse = {
  character?: Character;
  conversation?: Conversation | null;
  messages?: UIMessage[];
  error?: string;
};

export const apiPath = (path: string) => {
  const base = import.meta.env.VITE_GUESTBOOK_API_BASE || "";
  return `${base}${path}`;
};

export const messageText = (message: UIMessage) => {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as any).text)
    .join("");
};
