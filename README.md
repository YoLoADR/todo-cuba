# Todo Cuba — Application de gestion de tâches

> Benchmark Cuba PO-bot — Next.js 16, TDD, design system Merenza

## Stack

- **Next.js 16.3** (App Router, TypeScript strict)
- **SQLite** (better-sqlite3) + **Drizzle ORM**
- **Zod v4** — validation
- **Vitest** + **React Testing Library** — tests
- **Tailwind CSS v4** — styles (CSS-first)
- **Design System Merenza** — dark-first, zinc + amber
- **lucide-react** — icônes
- **@dnd-kit** — drag & drop Kanban

## Prérequis

- Node.js 22+
- npm 10+
- Python 3 + make + g++ (pour la compilation native de better-sqlite3)

## Installation

```bash
npm install
npm run db:migrate    # créer la base de données
npm run db:seed       # (optionnel) données de démo
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run test` | Tests unitaires + intégration (Vitest) |
| `npm run test:watch` | Tests en mode watch |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript --noEmit |
| `npm run db:generate` | Générer les migrations Drizzle |
| `npm run db:migrate` | Appliquer les migrations |
| `npm run e2e` | Tests end-to-end (Playwright) |

## Architecture

```
src/
├── app/          # App Router (pages, layouts, API routes)
├── components/   # Composants UI + design system Merenza
├── lib/          # DB, validations, utils
├── providers/    # ThemeProvider
└── types/        # Types partagés
```

## Méthodologie

- **API-first** : les routes API sont testées avant l'UI
- **TDD strict** : RED (test fail) → GREEN (test pass) → REFACTOR
- Voir `PLAN.md` pour le plan détaillé

## Design System Merenza

Dark-first, palette zinc + amber (#f59e0b), bordures > ombres, tokens `--mrz-*`.
Voir `PLAN.md` section 2.5.

## Licence

Benchmark — usage interne.