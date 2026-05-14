import { type UIMessage } from "ai";
import { MAX_STORED_CHAT_MESSAGE_LENGTH } from "./constants";
import {
  type AuthUser,
  type Character,
  type CharacterVisibility,
  type Conversation,
  type GuestbookMessage,
  type StoredChatMessage
} from "./types";

export function cleanText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeVisibility(value: unknown): CharacterVisibility {
  return value === "public" ? "public" : "private";
}

export function toGuestbookMessage(row: Record<string, unknown>): GuestbookMessage {
  return {
    id: Number(row.id),
    displayName: String(row.display_name || "Anonymous"),
    message: String(row.message || ""),
    createdAt: String(row.created_at || "")
  };
}

export function toAuthUser(row: Record<string, unknown>): AuthUser {
  return {
    id: String(row.id || ""),
    email: String(row.email || ""),
    name: String(row.name || ""),
    avatarUrl: String(row.avatar_url || "")
  };
}

export function toCharacter(row: Record<string, unknown>, currentUserId = ""): Character {
  const userId = String(row.user_id || "");
  return {
    id: String(row.id || ""),
    userId,
    name: String(row.name || ""),
    persona: String(row.persona || ""),
    greeting: String(row.greeting || ""),
    createdAt: String(row.created_at || ""),
    visibility: normalizeVisibility(row.visibility),
    isOwner: Boolean(currentUserId && userId === currentUserId),
    ownerName: String(row.owner_name || "")
  };
}

export function toConversation(row: Record<string, unknown>): Conversation {
  return {
    id: String(row.id || ""),
    characterId: String(row.character_id || ""),
    title: String(row.title || "New conversation"),
    createdAt: String(row.created_at || "")
  };
}

export function toStoredChatMessage(row: Record<string, unknown>): StoredChatMessage {
  const role = row.role === "assistant" ? "assistant" : "user";
  return {
    id: String(row.id || ""),
    conversationId: String(row.conversation_id || ""),
    role,
    content: String(row.content || ""),
    createdAt: String(row.created_at || "")
  };
}

export function toUiMessage(message: StoredChatMessage): UIMessage {
  return {
    id: message.id,
    role: message.role,
    parts: [{ type: "text", text: message.content }]
  };
}

export function textFromUiMessage(message: UIMessage) {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => {
      return part.type === "text" && typeof (part as { text?: unknown }).text === "string";
    })
    .map((part) => part.text)
    .join("")
    .trim();
}

export function clipStoredChatContent(content: string) {
  return content.trim().slice(0, MAX_STORED_CHAT_MESSAGE_LENGTH);
}

export function base64Url(bytes: ArrayBuffer | Uint8Array) {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of array) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function pkceChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(digest);
}

export function getCookieOptions(request: Request, maxAge: number) {
  return {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "Lax" as const,
    path: "/",
    maxAge
  };
}

export function getRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("Cookie") || "";
  const found = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : undefined;
}
