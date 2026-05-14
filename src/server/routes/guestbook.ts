import { Hono } from "hono";
import { createMessage, getMessages } from "../data/guestbook";
import { type AppBindings } from "../types";

export const guestbookRoutes = new Hono<AppBindings>();

guestbookRoutes.get("/messages", async (c) => {
  return c.json(await getMessages(c.env));
});

guestbookRoutes.post("/messages", async (c) => {
  const result = await createMessage(c.req.raw, c.env, c.executionCtx);
  if ("error" in result) return c.json(result, 400);
  return c.json(result, 201);
});
