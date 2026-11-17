# Basic Personal AI Assistant

This project contains a React frontend and an Express backend. The chat
interface sends messages to `POST /api/chat`, where the backend calls Google
Gemini and returns the generated response. The development echo endpoint is
also available for connection testing. This project does not include memory or
tool calling.

- [Backend setup and API](./backend/README.md)
- [Frontend setup and commands](./frontend/README.md)