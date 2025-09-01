# Note Taking App (Passwordless Auth)

A full-stack TypeScript app with passwordless authentication.
- Email + OTP signup/sign-in
- Google One Tap signup/sign-in
- JWT-protected Notes CRUD
- React + Vite (dev server on 8080)
- Express + Prisma + PostgreSQL (Neon)

## Tech Stack
- Frontend: React 18 + TypeScript + Vite
- Backend: Express 5 + TypeScript
- Auth: JWT (access token) + Google ID token verification
- DB: Prisma ORM + PostgreSQL (Neon)

## Prerequisites
- Node.js 18+
- pnpm 10+
- A Neon Postgres database URL
- Google OAuth Client (Web) Client ID/Secret

## Environment Variables
Create a `.env` file at the repo root (already added in this repo). Example:

```
# Frontend dev server (Vite) runs on 8080 per vite.config.ts
FRONTEND_URL=http://localhost:8080

# API base (client defaults to "/api" during dev via Vite+Express middleware)
# VITE_API_URL=http://localhost:3000/api

Notes:
- In development, the Express app is mounted into Vite dev server on port 8080, so the client can call `/api/*` directly without setting `VITE_API_URL`.
- For production builds, the server build in `dist/server` serves API; the SPA is built to `dist/spa`.

## Install & Database Setup
```
pnpm install
# On pnpm v10, approve build scripts for prisma
pnpm approve-builds

# Generate Prisma Client and run migration
pnpm prisma generate
pnpm prisma migrate dev --name init
```

## Development
```
# Start dev server (Vite + Express on http://localhost:8080)
pnpm dev
```

## Build for Production
```
# Build client and server bundles
pnpm build

# Start production server (Node)
pnpm start
```

## Usage
- Signup with email OTP or Google One Tap on `/`.
- Sign-in with email OTP or Google on `/signin`.
- After auth, you will be redirected to `/welcome` where you can:
  - See your user info
  - Create and delete notes (JWT protected)

## Security
- OTP codes are hashed and have expiry; consumed after verification.
- Google ID tokens are verified on the backend using `google-auth-library`.
- JWT access tokens are required for notes and `/api/me`.

## Troubleshooting
- If you see missing types (react, vite, node), run `pnpm install`.
- If Prisma complains about engines or client, run `pnpm approve-builds` then `pnpm prisma generate`.
- In development, OTP codes are printed to the server console for testing.
