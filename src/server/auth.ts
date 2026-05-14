import { deleteCookie, setCookie } from "hono/cookie";
import { type Context } from "hono";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_TTL_SECONDS,
  OAUTH_VERIFIER_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS
} from "./constants";
import { type AppBindings, type Env } from "./types";
import {
  getCookieOptions,
  getRedirectPath,
  pkceChallenge,
  randomToken,
  readCookie,
  sha256Hex,
  toAuthUser
} from "./utils";

export async function getCurrentUser(env: Env, sessionToken?: string) {
  if (!sessionToken) return null;
  const sessionId = await sha256Hex(sessionToken);
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.avatar_url
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND datetime(s.expires_at) > datetime('now')`
  ).bind(sessionId).first<Record<string, unknown>>();

  return row ? toAuthUser(row) : null;
}

export async function requireUser(env: Env, request: Request) {
  return getCurrentUser(env, readCookie(request, SESSION_COOKIE));
}

async function upsertGoogleUser(env: Env, profile: { sub: string; email: string; name?: string; picture?: string }) {
  const now = new Date().toISOString();
  const existing = await env.DB.prepare(
    `SELECT id, email, name, avatar_url
     FROM users
     WHERE google_sub = ? OR email = ?
     LIMIT 1`
  ).bind(profile.sub, profile.email).first<Record<string, unknown>>();

  if (existing) {
    await env.DB.prepare(
      `UPDATE users
       SET email = ?, name = ?, avatar_url = ?, google_sub = ?, updated_at = ?, last_login_at = ?
       WHERE id = ?`
    ).bind(profile.email, profile.name || "", profile.picture || "", profile.sub, now, now, String(existing.id)).run();

    return {
      id: String(existing.id),
      email: profile.email,
      name: profile.name || "",
      avatarUrl: profile.picture || ""
    };
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO users (id, email, name, avatar_url, google_sub, created_at, updated_at, last_login_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, profile.email, profile.name || "", profile.picture || "", profile.sub, now, now, now).run();

  return {
    id,
    email: profile.email,
    name: profile.name || "",
    avatarUrl: profile.picture || ""
  };
}

async function createSession(env: Env, userId: string) {
  const token = randomToken();
  const id = await sha256Hex(token);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_TTL_SECONDS * 1000).toISOString();

  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).bind(id, userId, expiresAt, createdAt.toISOString()).run();

  return token;
}

export async function handleMe(c: Context<AppBindings>) {
  const user = await requireUser(c.env, c.req.raw);
  return c.json({ user });
}

export async function handleGoogleStart(c: Context<AppBindings>) {
  if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) {
    return c.json({ error: "Google OAuth is not configured." }, 500);
  }

  const requestUrl = new URL(c.req.url);
  const redirectPath = getRedirectPath(requestUrl.searchParams.get("redirect"));
  const redirectUri = new URL("/api/auth/google/callback", requestUrl.origin).toString();
  const state = randomToken(24);
  const verifier = randomToken(48);
  const stateHash = await sha256Hex(state);
  const expiresAt = new Date(Date.now() + OAUTH_STATE_TTL_SECONDS * 1000).toISOString();

  deleteCookie(c, OAUTH_STATE_COOKIE, { path: "/" });
  deleteCookie(c, OAUTH_VERIFIER_COOKIE, { path: "/" });

  await c.env.DB.prepare(
    `INSERT INTO oauth_states (state_hash, redirect_path, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).bind(stateHash, redirectPath, expiresAt, new Date().toISOString()).run();

  setCookie(c, OAUTH_STATE_COOKIE, state, getCookieOptions(c.req.raw, OAUTH_STATE_TTL_SECONDS));
  setCookie(c, OAUTH_VERIFIER_COOKIE, verifier, getCookieOptions(c.req.raw, OAUTH_STATE_TTL_SECONDS));

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", c.env.GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("code_challenge", await pkceChallenge(verifier));
  googleUrl.searchParams.set("code_challenge_method", "S256");
  googleUrl.searchParams.set("prompt", "select_account");

  return c.redirect(googleUrl.toString(), 302);
}

export async function handleGoogleCallback(c: Context<AppBindings>) {
  if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) {
    return c.json({ error: "Google OAuth is not configured." }, 500);
  }

  const requestUrl = new URL(c.req.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const cookieState = readCookie(c.req.raw, OAUTH_STATE_COOKIE);
  const verifier = readCookie(c.req.raw, OAUTH_VERIFIER_COOKIE);

  if (!code || !state || !cookieState || !verifier || state !== cookieState) {
    return c.redirect("/?auth_error=invalid_oauth_state", 302);
  }

  const stateHash = await sha256Hex(state);
  const storedState = await c.env.DB.prepare(
    `SELECT redirect_path, expires_at, used_at
     FROM oauth_states
     WHERE state_hash = ?`
  ).bind(stateHash).first<Record<string, unknown>>();

  if (!storedState || storedState.used_at || new Date(String(storedState.expires_at)).getTime() < Date.now()) {
    return c.redirect("/?auth_error=expired_oauth_state", 302);
  }

  await c.env.DB.prepare(
    "UPDATE oauth_states SET used_at = ? WHERE state_hash = ?"
  ).bind(new Date().toISOString(), stateHash).run();

  const redirectUri = new URL("/api/auth/google/callback", requestUrl.origin).toString();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: verifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    })
  });

  if (!tokenResponse.ok) {
    console.error("Google token exchange failed", await tokenResponse.text());
    return c.redirect("/?auth_error=google_token_failed", 302);
  }

  const tokenData = await tokenResponse.json() as { access_token?: string };
  if (!tokenData.access_token) {
    return c.redirect("/?auth_error=google_token_missing", 302);
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  if (!profileResponse.ok) {
    console.error("Google profile fetch failed", await profileResponse.text());
    return c.redirect("/?auth_error=google_profile_failed", 302);
  }

  const profile = await profileResponse.json() as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  if (!profile.sub || !profile.email || profile.email_verified === false) {
    return c.redirect("/?auth_error=google_email_unverified", 302);
  }

  const user = await upsertGoogleUser(c.env, {
    sub: profile.sub,
    email: profile.email,
    name: profile.name,
    picture: profile.picture
  });
  const sessionToken = await createSession(c.env, user.id);

  setCookie(c, SESSION_COOKIE, sessionToken, getCookieOptions(c.req.raw, SESSION_TTL_SECONDS));
  deleteCookie(c, OAUTH_STATE_COOKIE, { path: "/" });
  deleteCookie(c, OAUTH_VERIFIER_COOKIE, { path: "/" });

  return c.redirect(getRedirectPath(String(storedState.redirect_path || "/")), 302);
}

export async function handleLogout(c: Context<AppBindings>) {
  const token = readCookie(c.req.raw, SESSION_COOKIE);
  if (token) {
    await c.env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(await sha256Hex(token)).run();
  }

  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
}
