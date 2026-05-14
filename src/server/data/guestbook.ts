import { CACHE_KEY, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from "../constants";
import { type Env } from "../types";
import { cleanText, toGuestbookMessage } from "../utils";

export async function getMessages(env: Env) {
  const cached = await env.GUESTBOOK_CACHE.get<{ messages: ReturnType<typeof toGuestbookMessage>[] }>(CACHE_KEY, "json");
  if (cached) {
    return { ...cached, cached: true };
  }

  const result = await env.DB.prepare(
    `SELECT id, display_name, message, created_at
     FROM guestbook_messages
     ORDER BY datetime(created_at) DESC, id DESC
     LIMIT 50`
  ).all<Record<string, unknown>>();

  const messages = (result.results ?? []).map(toGuestbookMessage);
  await env.GUESTBOOK_CACHE.put(CACHE_KEY, JSON.stringify({ messages }), {
    expirationTtl: 60
  });

  return { messages, cached: false };
}

async function parseMessagePayload(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return { error: "Invalid JSON payload." };
  }

  const input = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const displayName = cleanText(input.displayName, "Anonymous").slice(0, MAX_NAME_LENGTH) || "Anonymous";
  const message = cleanText(input.message).slice(0, MAX_MESSAGE_LENGTH);

  if (message.length < 2) {
    return { error: "Message must be at least 2 characters." };
  }

  return { displayName, message };
}

export async function createMessage(request: Request, env: Env, ctx: ExecutionContext) {
  const parsed = await parseMessagePayload(request);
  if ("error" in parsed) return parsed;

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const result = await env.DB.prepare(
    `INSERT INTO guestbook_messages (display_name, message, created_at)
     VALUES (?, ?, ?)
     RETURNING id, display_name, message, created_at`
  ).bind(parsed.displayName, parsed.message, createdAt).first<Record<string, unknown>>();

  ctx.waitUntil(env.GUESTBOOK_CACHE.delete(CACHE_KEY));

  return {
    message: result ? toGuestbookMessage(result) : {
      id: 0,
      displayName: parsed.displayName,
      message: parsed.message,
      createdAt
    },
    requestId: id
  };
}
