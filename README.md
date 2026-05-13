
# [https://opendota-cf-worker.pages.dev/](https://opendota-cf-worker.pages.dev/)


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `pnpm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `pnpm dev`

## Guestbook Worker

This app includes a Cloudflare Worker guestbook API backed by D1 and cached with KV.

- Frontend route: `/guestbook`
- Role chat route: `/`
- Dota dashboard route: `/dashboard`
- API route: `/api/guestbook/messages`
- Role APIs: `/api/characters`, `/api/chats`, `/api/chats/:id/messages`
- D1 migration: `migrations/0001_create_guestbook.sql`
- Workers AI binding: `AI`

Local Worker flow:

1. Apply local migrations:
   `pnpm db:migrate:local`
2. Run the Worker:
   `pnpm worker:dev`
3. Run the Vite frontend:
   `pnpm dev`

Deploy flow:

1. Apply remote migrations:
   `pnpm db:migrate:remote`
2. Deploy frontend assets and Worker:
   `pnpm worker:deploy`

Remote deploy requires `CLOUDFLARE_API_TOKEN` in the shell environment.
