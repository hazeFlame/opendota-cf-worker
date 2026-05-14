import { Hono } from "hono";
import { requireUser } from "../auth";
import { MAX_GREETING_LENGTH, MAX_NAME_LENGTH, MAX_PERSONA_LENGTH } from "../constants";
import {
  createConversation,
  getCharacter,
  getCharacters,
  getLatestConversation,
  getOwnedCharacter,
  getStoredChatMessages
} from "../data/characters";
import { type AppBindings } from "../types";
import { cleanText, normalizeVisibility, toUiMessage } from "../utils";

export const characterRoutes = new Hono<AppBindings>();

characterRoutes.get("/", async (c) => {
  const user = await requireUser(c.env, c.req.raw);
  if (!user) return c.json({ error: "Authentication required." }, 401);
  return c.json({ characters: await getCharacters(c.env, user.id) });
});

characterRoutes.post("/", async (c) => {
  const user = await requireUser(c.env, c.req.raw);
  if (!user) return c.json({ error: "Authentication required." }, 401);

  const payload = await c.req.json().catch(() => null);
  const input = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const name = cleanText(input.name, "Unnamed Character").slice(0, MAX_NAME_LENGTH) || "Unnamed Character";
  const persona = cleanText(input.persona).slice(0, MAX_PERSONA_LENGTH);
  const greeting = cleanText(input.greeting).slice(0, MAX_GREETING_LENGTH);
  const visibility = normalizeVisibility(input.visibility);

  if (persona.length < 10) {
    return c.json({ error: "Persona must be at least 10 characters." }, 400);
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await c.env.DB.prepare(
    `INSERT INTO ai_characters (id, user_id, name, persona, greeting, visibility, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user.id, name, persona, greeting, visibility, createdAt).run();

  return c.json({
    character: { id, name, persona, greeting, visibility, createdAt, isOwner: true, ownerName: user.name }
  }, 201);
});

characterRoutes.get("/:characterId/conversation", async (c) => {
  const user = await requireUser(c.env, c.req.raw);
  if (!user) return c.json({ error: "Authentication required." }, 401);

  const characterId = c.req.param("characterId");
  const character = await getCharacter(c.env, characterId, user.id);

  if (!character) {
    return c.json({ error: "Character not found." }, 404);
  }

  const conversation = await getLatestConversation(c.env, characterId, user.id);
  const messages = conversation ? await getStoredChatMessages(c.env, conversation.id) : [];

  return c.json({
    character,
    conversation,
    messages: messages.map(toUiMessage)
  });
});

characterRoutes.post("/:characterId/conversation", async (c) => {
  const user = await requireUser(c.env, c.req.raw);
  if (!user) return c.json({ error: "Authentication required." }, 401);

  const characterId = c.req.param("characterId");
  const character = await getCharacter(c.env, characterId, user.id);

  if (!character) {
    return c.json({ error: "Character not found." }, 404);
  }

  return c.json(await createConversation(c.env, character, user.id), 201);
});

characterRoutes.delete("/:characterId", async (c) => {
  const user = await requireUser(c.env, c.req.raw);
  if (!user) return c.json({ error: "Authentication required." }, 401);

  const characterId = c.req.param("characterId");
  const character = await getOwnedCharacter(c.env, characterId, user.id);

  if (!character) {
    return c.json({ error: "Character not found." }, 404);
  }

  await c.env.DB.batch([
    c.env.DB.prepare(
      `DELETE FROM ai_chat_messages
       WHERE conversation_id IN (
         SELECT id FROM ai_conversations WHERE character_id = ?
       )`
    ).bind(characterId),
    c.env.DB.prepare("DELETE FROM ai_conversations WHERE character_id = ?").bind(characterId),
    c.env.DB.prepare("DELETE FROM ai_characters WHERE id = ? AND user_id = ?").bind(characterId, user.id)
  ]);

  return c.json({ ok: true, deletedCharacterId: characterId });
});
