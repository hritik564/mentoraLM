# MentorAlm

AI-powered career counselling platform for Indian students — connects students with an AI counsellor (Claude) and real expert sessions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port assigned via `PORT` env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Optional env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — for payment processing
- Optional env: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — for email (welcome, OTP, booking confirmation)
- Admin: `ADMIN_EMAIL=admin@mentoralm.com`, `ADMIN_PASSWORD=Admin@123`, `JWT_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: Anthropic Claude (`claude-sonnet-4-6`) via Replit AI Integration
- Auth: JWT (access + refresh tokens), bcrypt, httpOnly cookie for refresh
- Payments: Razorpay (gracefully degrades if not configured)
- Email: Nodemailer (gracefully skipped if SMTP not configured)
- File uploads: Multer (saved to `./uploads/photos/`)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/routes/` — all Express route handlers
  - `auth.ts` — signup, signin, signout, refresh, forgot/reset-password
  - `profile.ts` — student profile CRUD + photo upload
  - `services.ts` — public services listing
  - `bookings.ts` — Razorpay order creation + verification
  - `chat.ts` — SSE streaming AI chat (Claude sonnet-4-6)
  - `roadmap.ts` — AI-generated career roadmap
  - `admin.ts` — admin panel routes (stats, students, bookings, services CRUD, contacts)
  - `contact.ts` — contact form submission
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth + admin middleware
- `artifacts/api-server/src/lib/jwt.ts` — JWT sign/verify utilities
- `artifacts/api-server/src/lib/email.ts` — Nodemailer email helpers
- `lib/db/src/schema/` — Drizzle table definitions (users, profiles, services, bookings, roadmaps, etc.)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks (run codegen to update)

## Architecture decisions

- Refresh tokens stored in DB (invalidatable on signout) + access tokens in-memory on client
- Chat messages stored in raw SQL table (`chat_messages`) using the shared `pool` from `@workspace/db`
- Roadmap stored as JSON string in DB; generated fresh from Claude on demand
- `completionPercent` computed server-side on every profile PATCH (24 tracked fields)
- Razorpay and email both fail gracefully if env vars not set (no startup crash)
- `pg` externalized in esbuild to avoid bundling issues

## Product

- **Public site**: Marketing pages (Home, About, Services, How It Works, Contact)
- **Auth**: JWT-based signup/signin with refresh tokens and forgot-password OTP flow
- **Student dashboard**: Profile wizard (6 steps), AI chat, marketplace, career roadmap
- **AI Chat**: Streaming Claude responses with full student profile injected as system prompt; 20 msg/day limit
- **Marketplace**: Browse/purchase services; Razorpay payment flow
- **Admin panel**: `/admin` — stats, students, bookings, services CRUD, contacts
- **Admin credentials**: `admin@mentoralm.com` / `Admin@123`

## User preferences

- Stack: React + Vite + TailwindCSS + Framer Motion (frontend), Express (backend)
- Design: Dark-themed, glassmorphism, `#1A1AFF` primary blue, `#FF5C00` orange accent
- Fonts: "Plus Jakarta Sans" (headings) + "Inter" (body) from Google Fonts
- ORM: Drizzle (workspace default), NOT Prisma as originally spec'd

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Run `pnpm --filter @workspace/db run push` after changing schema files
- `chat_messages` table created lazily on first chat request (not in Drizzle schema, raw SQL)
- Admin user must have `role = 'ADMIN'` in the `users` table — set via SQL after signup
- The admin user `admin@mentoralm.com` was created and promoted to ADMIN during initial setup
- Razorpay is optional — bookings work in "mock mode" without keys (no real payment processed)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
