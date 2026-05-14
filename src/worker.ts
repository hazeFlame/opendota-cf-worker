import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./server/routes/auth";
import { characterRoutes } from "./server/routes/characters";
import { chatRoutes } from "./server/routes/chats";
import { guestbookRoutes } from "./server/routes/guestbook";
import { type AppBindings } from "./server/types";

const app = new Hono<AppBindings>();

app.use("/api/*", cors({
  origin: "*",
  allowHeaders: ["content-type"],
  allowMethods: ["GET", "POST", "DELETE", "OPTIONS"]
}));

app.get("/api/health", (c) => {
  return c.json({ ok: true, service: "opendota-guestbook" });
});

app.route("/api/auth", authRoutes);
app.route("/api/guestbook", guestbookRoutes);
app.route("/api/characters", characterRoutes);
app.route("/api/chats", chatRoutes);

app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "API route not found.", path: c.req.path }, 404);
  }

  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }

  return c.json({
    ok: true,
    service: "opendota-guestbook",
    routes: ["/api/guestbook/messages", "/api/characters", "/api/chats"]
  });
});

export default app;
