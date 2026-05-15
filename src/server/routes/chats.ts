import { convertToModelMessages, smoothStream, streamText, type UIMessage } from "ai";
import { Hono } from "hono";
import { createWorkersAI } from "workers-ai-provider";
import { requireUser } from "../auth";
import { buildCharacterSystemPrompt } from "../chatPrompt";
import { CHAT_MODEL, MAX_CHAT_MESSAGE_LENGTH } from "../constants";
import {
  createConversation,
  getCharacter,
  getConversationWithCharacter,
  getStoredChatMessages,
  storeChatMessage
} from "../data/characters";
import { type AppBindings } from "../types";
import { cleanText, normalizeVisibility, textFromUiMessage, toConversation, toUiMessage } from "../utils";

export const chatRoutes = new Hono<AppBindings>();

chatRoutes.post("/", async (c) => {
  const user = await requireUser(c.env, c.req.raw);
  if (!user) return c.json({ error: "Authentication required." }, 401);

  const payload = await c.req.json().catch(() => null);
  const input = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const characterId = cleanText(input.characterId);
  const character = characterId ? await getCharacter(c.env, characterId, user.id) : null;

  if (!character) {
    return c.json({ error: "Character not found." }, 404);
  }

  return c.json(await createConversation(c.env, character, user.id), 201);
});

chatRoutes.get("/:chatId", async (c) => {
  const user = await requireUser(c.env, c.req.raw);
  if (!user) return c.json({ error: "Authentication required." }, 401);

  const chatId = c.req.param("chatId");
  const conversation = await getConversationWithCharacter(c.env, chatId, user.id);

  if (!conversation) {
    return c.json({ error: "Conversation not found." }, 404);
  }

  const messages = await getStoredChatMessages(c.env, chatId);
  return c.json({
    conversation: toConversation(conversation),
    character: {
      id: String(conversation.character_id || ""),
      name: String(conversation.character_name || ""),
      persona: String(conversation.character_persona || ""),
      greeting: String(conversation.character_greeting || ""),
      createdAt: "",
      visibility: normalizeVisibility(conversation.character_visibility),
      isOwner: String(conversation.character_user_id || "") === user.id,
      ownerName: ""
    },
    messages: messages.map(toUiMessage)
  });
});

chatRoutes.post("/:chatId/messages", async (c) => {
  const user = await requireUser(c.env, c.req.raw);
  if (!user) return c.json({ error: "Authentication required." }, 401);

  const chatId = c.req.param("chatId");
  const conversation = await getConversationWithCharacter(c.env, chatId, user.id);

  if (!conversation) {
    return c.json({ error: "Conversation not found." }, 404);
  }

  const payload = await c.req.json().catch(() => null);
  const messages = payload && typeof payload === "object" && Array.isArray((payload as { messages?: unknown }).messages)
    ? (payload as { messages: UIMessage[] }).messages
    : [];
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const userText = lastUserMessage ? textFromUiMessage(lastUserMessage).slice(0, MAX_CHAT_MESSAGE_LENGTH) : "";

  if (userText.length < 1) {
    return c.json({ error: "Message is required." }, 400);
  }

  await storeChatMessage(c.env, chatId, "user", userText);

  const workersai = createWorkersAI({ binding: c.env.AI });
  const modelMessages = await convertToModelMessages(messages, {
    ignoreIncompleteToolCalls: true
  });

  const result = streamText({
    model: workersai(CHAT_MODEL),
    system: buildCharacterSystemPrompt(
      String(conversation.character_name || "the character"),
      String(conversation.character_persona || "")
    ),
    messages: modelMessages,
    temperature: 0.8,
    providerOptions: {
      "workers-ai": {
        reasoning_effort: null,
        chat_template_kwargs: {
          enable_thinking: false,
          clear_thinking: true
        }
      }
    },
    experimental_transform: smoothStream({
      delayInMs: 80,
      chunking: /[\u3002\uff01\uff1f.!?]\s*|\s+/
    })
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    sendReasoning: false,
    onFinish: async ({ responseMessage }) => {
      const assistantText = textFromUiMessage(responseMessage);
      if (!assistantText) return;

      try {
        await storeChatMessage(c.env, chatId, "assistant", assistantText);
      } catch (error) {
        console.error("Failed to store assistant message", {
          chatId,
          length: assistantText.length,
          error
        });
      }
    },
    headers: {
      "content-encoding": "identity"
    }
  });
});
