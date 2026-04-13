# Open Estate Sales

**Open Estate Sales** is a free, open way to discover and post estate sales. We are building a public alternative so communities are not locked into a single paid listing gatekeeper. For years, many areas have effectively depended on one commercial directory (for example **EstateSales.net** / **ES.NET**); this project is meant to break that kind of lock-in with software anyone can inspect, host, and extend.

**Website:** [openestatesales.com](https://openestatesales.com)

## Why this exists

Estate sale listings should be easy to share and easy to find without a monopoly controlling who gets visibility. This project exists to give sellers, buyers, and communities a transparent, open option that anyone can run, fork, and improve.

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0). If you run a modified version as a network service, you must make your changes available under the same license—so improvements flow back to everyone.

## Run locally

Prerequisites: [Node.js](https://nodejs.org/) (LTS recommended).

```bash
npm install
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from your Supabase project (Settings → API).
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Edit `src/app/page.tsx` (and related files); the app hot-reloads.

## Supabase (waitlist)

Database migrations and the **`waitlist`** Edge Function live under `supabase/`. Apply the migration and deploy the function to your Supabase project, then set the public URL and anon key in `.env.local`. See [db-schemas/README.md](db-schemas/README.md) for commands (`supabase db push`, `supabase functions deploy waitlist`).

Other commands:

```bash
npm run build   # production build
npm run start   # run production server locally
npm run lint    # ESLint
```

## Tech stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Contributing

We welcome issues and pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for workflow, standards, and how to propose changes.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Project layout (high level)

```
├── LICENSE
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── .env.example
├── db-schemas/       # Notes; SQL migrations are in supabase/migrations/
├── supabase/
│   ├── migrations/
│   └── functions/waitlist/
└── .github/          # Issue and PR templates
```
