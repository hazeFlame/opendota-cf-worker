/// <reference types="@cloudflare/workers-types" />

export type Env = {
  AI: Ai;
  DB: D1Database;
  GUESTBOOK_CACHE: KVNamespace;
  ASSETS?: Fetcher;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

export type AppBindings = {
  Bindings: Env;
};

export type GuestbookMessage = {
  id: number;
  displayName: string;
  message: string;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
};

export type CharacterVisibility = "private" | "public";

export type Character = {
  id: string;
  userId: string;
  name: string;
  persona: string;
  greeting: string;
  createdAt: string;
  visibility: CharacterVisibility;
  isOwner: boolean;
  ownerName: string;
};

export type Conversation = {
  id: string;
  characterId: string;
  title: string;
  createdAt: string;
};

export type StoredChatMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};
