# @oes/api

Minimal API service for the developer platform.

## Required env

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (optional; default `3002`)

## Dev

```bash
npm -w @oes/api run dev
```

## Endpoints

- `GET /health`
- `POST /v1/sales` (requires `Authorization: Bearer <apiKey>`)

