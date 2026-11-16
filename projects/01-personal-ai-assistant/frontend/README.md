# Personal Assistant Frontend

## Setup

From this directory, install dependencies and create a local environment file:

```powershell
npm.cmd install
Copy-Item .env.example .env
```

Set `VITE_API_BASE_URL` in `.env` to the backend origin. It defaults to
`http://localhost:3000`.

## Commands

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
```

The development server uses `http://localhost:5173`, which is allowed by the
backend's default CORS configuration. Start the backend separately before
sending messages.

The chat uses `POST /api/dev/echo` for frontend/backend communication testing;
it does not generate AI responses.
