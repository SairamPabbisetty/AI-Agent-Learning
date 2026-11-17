# Personal AI Assistant Backend

## Setup

From this directory, install dependencies:

```powershell
npm.cmd install
```

Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your private Google
AI Studio key. Keep `.env` private and never add it to source control.
The example configures `GEMINI_MODEL=gemini-3.1-flash-lite`. `PORT` defaults
to `3000`; `CORS_ORIGIN` is a comma-separated allowlist and defaults to
`http://localhost:5173`.

## Commands

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run test:integration
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

`npm.cmd run dev` starts the API with watch mode and loads `.env`. Run
`npm.cmd run test:integration` separately to call the real Gemini API; it skips
when the Gemini configuration is missing. Build before running `npm.cmd start`.

## Endpoints

- `GET /api/health` returns the backend status and timestamp.
- `POST /api/chat` accepts `{ "message": "..." }` and returns a generated
  response in `{ "success": true, "data": { "message": "..." } }`.
- `POST /api/dev/echo` accepts `{ "message": "..." }` and returns the same
  message in a structured response. It is for communication testing only.
