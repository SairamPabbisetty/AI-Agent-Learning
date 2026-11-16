# Personal AI Assistant Backend

## Setup

From this directory, install dependencies:

```powershell
npm.cmd install
```

Copy `.env.example` to `.env` if you want to configure the backend locally.
`PORT` defaults to `3000`; `CORS_ORIGIN` is a comma-separated allowlist and
defaults to `http://localhost:5173`.

## Commands

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

`npm.cmd run dev` starts the API with watch mode. Build before running
`npm.cmd start`.

## Endpoints

- `GET /api/health` returns the backend status and timestamp.
- `POST /api/dev/echo` accepts `{ "message": "..." }` and returns the same
  message in a structured response. It is for communication testing only.
