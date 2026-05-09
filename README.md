<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/af08e5b1-2f50-4763-a902-cb379f7aa13f

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
- API route: `/api/guestbook/messages`
- D1 migration: `migrations/0001_create_guestbook.sql`

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
