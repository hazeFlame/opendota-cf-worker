/// <reference types="@cloudflare/workers-types" />

type GuestbookMessage = {
  id: number;
  displayName: string;
  message: string;
  createdAt: string;
};

type Env = {
  DB: D1Database;
  GUESTBOOK_CACHE: KVNamespace;
  ASSETS?: Fetcher;
};

const CACHE_KEY = "guestbook:messages:v1";
const MAX_NAME_LENGTH = 40;
const MAX_MESSAGE_LENGTH = 500;

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type"
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init.headers
    }
  });
}

function cleanText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.replace(/\s+/g, " ").trim();
}

function toGuestbookMessage(row: Record<string, unknown>): GuestbookMessage {
  return {
    id: Number(row.id),
    displayName: String(row.display_name || "Anonymous"),
    message: String(row.message || ""),
    createdAt: String(row.created_at || "")
  };
}

async function listMessages(env: Env) {
  const cached = await env.GUESTBOOK_CACHE.get<{ messages: GuestbookMessage[] }>(CACHE_KEY, "json");
  if (cached) {
    return jsonResponse({ ...cached, cached: true });
  }

  const result = await env.DB.prepare(
    `SELECT id, display_name, message, created_at
     FROM guestbook_messages
     ORDER BY datetime(created_at) DESC, id DESC
     LIMIT 50`
  ).all<Record<string, unknown>>();

  const messages = result.results.map(toGuestbookMessage);
  await env.GUESTBOOK_CACHE.put(CACHE_KEY, JSON.stringify({ messages }), {
    expirationTtl: 60
  });

  return jsonResponse({ messages, cached: false });
}

async function createMessage(request: Request, env: Env, ctx: ExecutionContext) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const input = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const displayName = cleanText(input.displayName, "Anonymous").slice(0, MAX_NAME_LENGTH) || "Anonymous";
  const message = cleanText(input.message).slice(0, MAX_MESSAGE_LENGTH);

  if (message.length < 2) {
    return jsonResponse({ error: "Message must be at least 2 characters." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const result = await env.DB.prepare(
    `INSERT INTO guestbook_messages (display_name, message, created_at)
     VALUES (?, ?, ?)
     RETURNING id, display_name, message, created_at`
  ).bind(displayName, message, createdAt).first<Record<string, unknown>>();

  ctx.waitUntil(env.GUESTBOOK_CACHE.delete(CACHE_KEY));

  return jsonResponse({
    message: result ? toGuestbookMessage(result) : {
      id: 0,
      displayName,
      message,
      createdAt
    },
    requestId: id
  }, { status: 201 });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: jsonHeaders });
    }

    if (url.pathname === "/api/guestbook/messages") {
      if (request.method === "GET") return listMessages(env);
      if (request.method === "POST") return createMessage(request, env, ctx);
      return jsonResponse({ error: "Method not allowed." }, { status: 405 });
    }

    if (url.pathname === "/api/health") {
      return jsonResponse({ ok: true, service: "opendota-guestbook" });
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return jsonResponse({ ok: true, service: "opendota-guestbook", routes: ["/api/guestbook/messages"] });
  }
};
