# Open Estate Sales

**Open Estate Sales** is an open-source way to discover and post estate sales—software anyone can inspect, host, and extend—so communities are not locked into a single paid listing gatekeeper.

**Website:** [openestatesales.com](https://openestatesales.com)  
**Developer portal:** [developer.openestatesales.com](https://developer.openestatesales.com)  
**Repository:** [github.com/openestatesales/core](https://github.com/openestatesales/core)

## Why this exists

Listings should be easy to share and find. This project is a transparent stack anyone can run, fork, and improve.

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0). If you run a modified version as a network service, you must make your changes available under the same license—so improvements flow back to everyone.

---

## Getting started (contributors)

This repo is an **npm workspaces** monorepo managed with **Turborepo**. You will run **two Next.js apps** (`apps/web` and `apps/developer`) and optionally a **local Supabase** stack for database and auth.

### Prerequisites

- **[Node.js](https://nodejs.org/)** — current LTS is recommended.
- **npm** — this repo pins [npm@11.6.2](package.json) via `packageManager`. Use a compatible npm (for example `corepack enable` then `corepack prepare npm@11.6.2 --activate`, or install npm 11.x another way you prefer).
- **Docker Desktop** (or another Docker engine) — **required only if** you run Supabase locally with the Supabase CLI (`supabase start`). Not needed if you point the apps at a hosted Supabase project only.

### 1. Clone and install dependencies

```bash
git clone https://github.com/openestatesales/core.git
cd core
npm install
```

### 2. Environment variables

Each Next.js app loads its own `.env.local` from its app directory (not the repo root).

#### Web app (`apps/web`)

```bash
cp apps/web/.env.example apps/web/.env.local
```

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Required — Supabase project URL (local or hosted). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required — Supabase anonymous (public) key. |
| `NEXT_PUBLIC_SITE_URL` | Recommended — base URL for auth/email redirects. If unset, the app defaults to `http://localhost:3000`. Set it to the origin you use in the browser (local, staging, or production) so Supabase redirect allow-lists stay aligned. |

#### Developer portal (`apps/developer`)

```bash
cp apps/developer/.env.example apps/developer/.env.local
```

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Required — Supabase project URL (local or hosted). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required — Supabase anonymous (public) key. |

GitHub sign-in builds the OAuth `redirectTo` from `window.location.origin` (see `apps/developer/src/app/login/page.tsx`), not from `NEXT_PUBLIC_SITE_URL`. The developer `.env.example` may still list `NEXT_PUBLIC_SITE_URL`; the current app code does not read it.

**Web-only optional variables** (in `apps/web/.env.local`):

- `NEXT_PUBLIC_APP_STAGE` — product banner stage (`building` \| `experimental` \| `alpha` \| `beta` \| `live`).

#### Google Maps API key and Map ID (optional, `apps/web` only)

The web sales map uses the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript). Add both to `apps/web/.env.local` when you need maps locally or in preview deploys. You can skip them if you are not working on map-related features.

1. Open the **[Google Cloud Console](https://console.cloud.google.com/)** and select or create a project.
2. Ensure **[billing](https://console.cloud.google.com/billing)** is enabled for that project (Google requires it for Maps Platform usage, including development).
3. Go to **APIs & Services → Library**, search for **Maps JavaScript API**, and click **Enable**.
4. Go to **APIs & Services → Credentials → Create credentials → API key**. Copy the key into `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
5. **Edit** that API key (recommended before any real traffic):
   - Under **Application restrictions**, choose **HTTP referrers (web sites)** and add at least `http://localhost:3000/*` (and your staging/production origins when you deploy).
   - Under **API restrictions**, choose **Restrict key** and select **Maps JavaScript API**.
6. Create a **Map ID** so the app can use [Map ID–based maps](https://developers.google.com/maps/documentation/javascript/map-ids) (needed for advanced markers in the UI):
   - In the console, open **Google Maps Platform** (from the menu or [this overview](https://console.cloud.google.com/google/maps-apis)) and go to **Map management** (older UIs may label it **Map IDs** or **Map Styles**).
   - Choose **Create map ID** (or equivalent). Pick type **JavaScript** / vector map, name it, optionally attach a map style, then save.
   - Copy the **Map ID** string into `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`.

Official overview: [Use API keys](https://developers.google.com/maps/documentation/javascript/get-api-key).

Never commit real `.env.local` files; they are gitignored.

### 3. Supabase: pick local or hosted

#### Option A — Local Supabase (recommended for full-stack work)

1. Install the **[Supabase CLI](https://supabase.com/docs/guides/cli)**.
2. From the **repository root**:

   ```bash
   supabase start
   ```

3. After the stack is up, the CLI prints API URL, anon key, and service role key. Set in **both** `apps/web/.env.local` and `apps/developer/.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL` — typically `http://127.0.0.1:54331` (see [supabase/config.toml](supabase/config.toml) `[api] port`).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — value from `supabase status` (or the startup output).

4. Schema lives in [supabase/migrations/](supabase/migrations/). For routine work, follow the [Supabase CLI local development](https://supabase.com/docs/guides/cli/local-development) flow so you do not wipe data unnecessarily.

   **Optional — full local wipe:** `supabase db reset` reapplies every migration and runs [supabase/seed.sql](supabase/seed.sql) after **deleting all data** in the Postgres instance used by **`supabase start` on this machine** (your local Docker stack). It does **not** reset a hosted Supabase project by itself, but it is destructive for anything you had only in that local database—saved test rows, manual fixtures, etc. Skip this step unless you intentionally want a clean local slate.

   ```bash
   supabase db reset   # local Docker DB only; all local DB data is lost
   ```

Useful local URLs (defaults from this repo’s `config.toml`):

- **API:** `http://127.0.0.1:54331`
- **Studio:** `http://127.0.0.1:54333`
- **Inbucket (email testing):** `http://127.0.0.1:54334`

If you use **GitHub sign-in** on the developer portal against **local** Supabase, enable the GitHub provider under **Authentication → Providers**. Add the OAuth return URLs you use—for example `http://localhost:3001/auth/callback` and `http://127.0.0.1:3001/auth/callback`—to `additional_redirect_urls` in [supabase/config.toml](supabase/config.toml) under `[auth]` (defaults target the web app on port **3000**). Use the same scheme and host you open in the browser; the app may append a `?next=` query on top of `/auth/callback`.

#### Option B — Hosted Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy **Project URL** and **anon public** key into both apps’ `.env.local` files.
3. Link the CLI to your project and push migrations (from repo root):

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

4. Deploy the **`waitlist`** Edge Function when you need that feature in your environment:

   ```bash
   supabase functions deploy waitlist
   ```

Function source: [supabase/functions/waitlist/](supabase/functions/waitlist/).

### 4. Run the apps

From the **repository root**, start everything that defines a `dev` script (both apps):

```bash
npm run dev
```

- **Web:** [http://localhost:3000](http://localhost:3000) (`apps/web` — default Next.js port).
- **Developer portal:** [http://localhost:3001](http://localhost:3001) (`apps/developer` — port set in its `package.json`).

Run a **single** app:

```bash
npm run dev -- --filter=@oes/web
npm run dev -- --filter=@oes/developer
```

Edit `apps/web/src/**` or `apps/developer/src/**`; dev servers hot-reload.

### 5. Verify before you open a PR

From the repo root:

```bash
npm run lint
npm run typecheck
npm run build
```

Other useful commands:

```bash
npm run start   # production servers (after build)
```

---

## Tech stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres, Auth, Edge Functions)
- [Turborepo](https://turbo.build/)

This repo tracks a **recent Next.js major**; APIs and file conventions may differ from older tutorials. When in doubt, check the in-repo docs under `node_modules/next/dist/docs/` for the version you have installed.

## Contributing

We welcome issues and pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for workflow, standards, and how to propose changes.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Project layout (high level)

```
├── apps/
│   ├── web/          # openestatesales.com (Next.js)
│   └── developer/    # developer.openestatesales.com (Next.js)
├── packages/
│   ├── ui/           # shared UI package (@oes/ui)
│   └── sdk/          # shared TypeScript client (@oes/sdk)
├── supabase/         # migrations, seed, Edge Functions, local CLI config
└── turbo.json
```
