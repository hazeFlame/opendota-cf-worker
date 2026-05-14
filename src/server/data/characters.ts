import { type Character, type Env } from "../types";
import { clipStoredChatContent, toCharacter, toConversation, toStoredChatMessage, toUiMessage } from "../utils";

export async function getCharacters(env: Env, userId: string) {
  const result = await env.DB.prepare(
    `SELECT
       ch.id,
       ch.user_id,
       ch.name,
       ch.persona,
       ch.greeting,
       ch.created_at,
       ch.visibility,
       u.name AS owner_name
     FROM ai_characters ch
     LEFT JOIN users u ON u.id = ch.user_id
     WHERE ch.user_id = ? OR ch.visibility = 'public'
     ORDER BY
       CASE WHEN ch.user_id = ? THEN 0 ELSE 1 END,
       datetime(ch.created_at) DESC
     LIMIT 100`
  ).bind(userId, userId).all<Record<string, unknown>>();

  return (result.results ?? []).map((row) => toCharacter(row, userId));
}

export async function getCharacter(env: Env, characterId: string, userId: string) {
  const result = await env.DB.prepare(
    `SELECT
       ch.id,
       ch.user_id,
       ch.name,
       ch.persona,
       ch.greeting,
       ch.created_at,
       ch.visibility,
       u.name AS owner_name
     FROM ai_characters ch
     LEFT JOIN users u ON u.id = ch.user_id
     WHERE ch.id = ? AND (ch.user_id = ? OR ch.visibility = 'public')`
  ).bind(characterId, userId).first<Record<string, unknown>>();

  return result ? toCharacter(result, userId) : null;
}

export async function getOwnedCharacter(env: Env, characterId: string, userId: string) {
  const result = await env.DB.prepare(
    `SELECT
       ch.id,
       ch.user_id,
       ch.name,
       ch.persona,
       ch.greeting,
       ch.created_at,
       ch.visibility,
       u.name AS owner_name
     FROM ai_characters ch
     LEFT JOIN users u ON u.id = ch.user_id
     WHERE ch.id = ? AND ch.user_id = ?`
  ).bind(characterId, userId).first<Record<string, unknown>>();

  return result ? toCharacter(result, userId) : null;
}

export async function getLatestConversation(env: Env, characterId: string, userId: string) {
  const result = await env.DB.prepare(
    `SELECT id, character_id, title, created_at
     FROM ai_conversations
     WHERE character_id = ? AND user_id = ?
     ORDER BY datetime(created_at) DESC
     LIMIT 1`
  ).bind(characterId, userId).first<Record<string, unknown>>();

  return result ? toConversation(result) : null;
}

export async function getConversationWithCharacter(env: Env, conversationId: string, userId: string) {
  return env.DB.prepare(
    `SELECT
       c.id,
       c.character_id,
       c.title,
       c.created_at,
       ch.name AS character_name,
       ch.persona AS character_persona,
       ch.greeting AS character_greeting,
       ch.user_id AS character_user_id,
       ch.visibility AS character_visibility
     FROM ai_conversations c
     JOIN ai_characters ch ON ch.id = c.character_id
     WHERE c.id = ? AND c.user_id = ?`
  ).bind(conversationId, userId).first<Record<string, unknown>>();
}

export async function getStoredChatMessages(env: Env, conversationId: string) {
  const result = await env.DB.prepare(
    `SELECT id, conversation_id, role, content, created_at
     FROM ai_chat_messages
     WHERE conversation_id = ?
     ORDER BY datetime(created_at) ASC`
  ).bind(conversationId).all<Record<string, unknown>>();

  return (result.results ?? []).map(toStoredChatMessage);
}

export async function storeChatMessage(env: Env, conversationId: string, role: "user" | "assistant", content: string) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const storedContent = clipStoredChatContent(content);

  await env.DB.prepare(
    `INSERT INTO ai_chat_messages (id, conversation_id, role, content, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(id, conversationId, role, storedContent, createdAt).run();

  return { id, conversationId, role, content: storedContent, createdAt };
}

export async function createConversation(env: Env, character: Character, userId: string) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const title = `Chat with ${character.name}`;

  await env.DB.prepare(
    `INSERT INTO ai_conversations (id, character_id, user_id, title, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(id, character.id, userId, title, createdAt).run();

  const messages = [];
  if (character.greeting) {
    messages.push(await storeChatMessage(env, id, "assistant", character.greeting));
  }

  return {
    conversation: { id, characterId: character.id, title, createdAt },
    messages: messages.map(toUiMessage)
  };
}
