# PLAN.md — Todo App Next.js (Benchmark Cuba)

> Document de planification produit et technique.
> Auteur : Yanet (PO/Lead Dev, profil Cuba PO-bot)
> Source : Issue #6 — [PROJET] Todo App Next.js — Benchmark
> Date : 2026-08-04

---

## 1. Analyse du besoin

### 1.1 Vision

Application de gestion de tâches (Todo) avec vue Kanban, filtres avancés et thème dark/light.
Benchmark visant à évaluer la capacité à livrer une application complète, testée et documentée
en autonomie totale (le client ne communique que via GitHub Issues/PRs et Telegram).

### 1.2 Utilisateurs cibles

Utilisateur unique (pas d'authentification). L'app gère les tâches d'une seule personne.

### 1.3 Features (de la spec)

| # | Feature | Détail |
|---|---------|--------|
| F1 | CRUD tasks | Titre, description, priorité (low/medium/high), catégorie, date d'échéance |
| F2 | Kanban drag & drop | Colonnes : À faire, En cours, Terminé |
| F3 | Filtres avancés | Par priorité, catégorie, statut, recherche texte |
| F4 | Dark/Light theme | Toggle + persistance localStorage |

### 1.4 Questions / clarifications (résolutions par le PO)

> Le client ne communique pas en direct. Le PO résout les ambiguïtés et documente les décisions.

**Q1. Catégorie — valeurs libres ou prédéfinies ?**
Décision : champ texte libre avec suggestions prédéfinies (Travail, Personnel, Courses, Santé,
Autre). L'utilisateur peut saisir ce qu'il veut. Stocké comme string nullable.

**Q2. Ordre des tâches dans le Kanban ?**
Décision : ajout d'un champ `position` (integer) pour l'ordre dans chaque colonne.
Les nouvelles tâches sont ajoutées en bas de la colonne « À faire ».

**Q3. Authentification / multi-utilisateurs ?**
Décision : non. Application mono-utilisateur, pas d'auth.

**Q4. Déploiement ?**
Décision : non couvert par le benchmark. L'app tourne en local (`npm run dev`).
SQLite via better-sqlite3 (synchrone, côté serveur uniquement).

**Q5. Bibliothèque de drag & drop ?**
Décision : `@dnd-kit/core` + `@dnd-kit/sortable` (standard React, accessible, maintenu,
compatible React 19/Next 16). Non listé dans la stack imposée mais nécessaire pour F2.

**Q6. Soft delete ou hard delete ?**
Décision : hard delete. Pas d'archive ni corbeille pour ce benchmark.

---

## 2. Architecture technique

### 2.1 Stack confirmée (versions vérifiées au 2026-08-04)

| Package | Version | Rôle |
|---------|---------|------|
| next | 16.3.0 | Framework App Router, LTS |
| react / react-dom | 19.x | UI runtime (inclus avec Next 16) |
| typescript | 5.x | Typage strict |
| better-sqlite3 | 13.0.2 | Driver SQLite synchrone |
| drizzle-orm | 0.45.2 | ORM |
| drizzle-kit | 0.x | Migrations SQL |
| zod | 4.4.3 | Validation runtime + types |
| vitest | 4.1.10 | Test runner |
| @testing-library/react | 16.x | Tests composants UI |
| @playwright/test | 1.62.1 | E2E (optionnel) |
| tailwindcss | 4.3.3 | Styles (v4, config CSS-first) |
| lucide-react | 1.28.0 | Icônes |
| @dnd-kit/core + @dnd-kit/sortable | 6.x | Drag & drop Kanban |

### 2.2 Structure du projet

```
todo-cuba/
├── src/
│   ├── app/                      # App Router
│   │   ├── layout.tsx            # Root layout (ThemeProvider, fonts, metadata)
│   │   ├── page.tsx              # Page principale (Kanban + filtres)
│   │   ├── globals.css           # Tokens Merenza + Tailwind v4
│   │   └── api/
│   │       └── tasks/
│   │           ├── route.ts      # GET (list+filters), POST (create)
│   │           └── [id]/
│   │               └── route.ts  # GET, PATCH, DELETE
│   ├── components/
│   │   ├── ui/                   # Design system Merenza
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── empty-state.tsx
│   │   │   └── page-header.tsx
│   │   ├── kanban/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   └── task-card.tsx
│   │   ├── task-form.tsx          # Form create/edit
│   │   ├── task-filters.tsx      # Filtres avancés
│   │   └── theme-toggle.tsx      # Bouton dark/light
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts         # Schéma Drizzle
│   │   │   ├── client.ts         # Connexion SQLite
│   │   │   └── migrations/       # Migrations SQL
│   │   ├── validations/
│   │   │   └── task.ts           # Schémas Zod (create, update, filters)
│   │   └── utils.ts              # Helpers
│   ├── providers/
│   │   └── theme-provider.tsx   # ThemeProvider + useTheme
│   └── types/
│       └── index.ts              # Types partagés
├── tests/
│   ├── api/
│   │   └── tasks.test.ts         # Tests d'intégration API
│   ├── components/
│   │   ├── button.test.tsx
│   │   ├── theme-toggle.test.tsx
│   │   └── ...
│   └── e2e/                      # Playwright (optionnel)
│       └── kanban.spec.ts
├── drizzle.config.ts
├── vitest.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

### 2.3 Modèle de données

```typescript
// tasks table
{
  id:          string (uuid, PK)
  title:       string (1-200, NOT NULL)
  description: string (0-2000, nullable)
  priority:    enum('low' | 'medium' | 'high'), default 'medium'
  category:    string (nullable, free text)
  status:      enum('todo' | 'in-progress' | 'done'), default 'todo'
  dueDate:     string (ISO 8601 date, nullable)
  position:    integer (ordre dans la colonne), default 0
  createdAt:   string (ISO 8601 datetime)
  updatedAt:   string (ISO 8601 datetime)
}
```

### 2.4 API (Route Handlers, API-first)

| Méthode | Route | Description | Query params / Body |
|---------|-------|-------------|---------------------|
| GET | `/api/tasks` | Liste filtrée | `?priority=&category=&status=&q=` |
| POST | `/api/tasks` | Création | `{ title, description?, priority?, category?, dueDate? }` |
| GET | `/api/tasks/:id` | Détail | — |
| PATCH | `/api/tasks/:id` | Mise à jour partielle | `{ title?, description?, priority?, category?, status?, dueDate?, position? }` |
| DELETE | `/api/tasks/:id` | Suppression | — |

Toutes les réponses sont en JSON. Codes HTTP standards :
- 200 (OK), 201 (Created), 204 (No Content), 400 (Validation), 404 (Not Found), 500 (Server Error).

### 2.5 Design System Merenza

Basé sur les 14 points de l'issue #6 (le fichier de référence local n'est pas accessible).

**Tokens CSS (`--mrz-*`)** dans `globals.css` :

```css
/* Dark-first (défaut) */
:root, [data-theme="dark"] {
  --mrz-bg:           #18181b;        /* zinc-900 */
  --mrz-bg-elevated:  #27272a;        /* zinc-800 */
  --mrz-border:       #3f3f46;        /* zinc-700 */
  --mrz-text:         #fafafa;        /* zinc-50 */
  --mrz-text-muted:   #a1a1aa;        /* zinc-400 */
  --mrz-accent:       #f59e0b;        /* amber-500 */
  --mrz-accent-muted: #f59e0b/20;
  --mrz-danger:       #ef4444;
  --mrz-success:     #22c55e;
  --mrz-radius-sm:    6px;   /* interactifs */
  --mrz-radius-md:    8px;   /* conteneurs */
}

[data-theme="light"] {
  --mrz-bg:           #fafafa;
  --mrz-bg-elevated:  #ffffff;
  --mrz-border:       #e4e4e7;
  --mrz-text:         #18181b;
  --mrz-text-muted:   #71717a;
  --mrz-accent:       #f59e0b;
  --mrz-danger:       #dc2626;
  --mrz-success:     #16a34a;
}
```

**Composants (6 minimum)** : Button, Input, Badge, Card, EmptyState, PageHeader.
Chacun respecte : bordures > ombres, focus ring `ring-2 ring-amber-500/50 ring-offset-2`,
icônes lucide-react avec `currentColor`, pas de décoration gratuite, a11y.

**Thème** : `data-theme` sur `<html>`, localStorage, `prefers-color-scheme`, fallback dark.
Hook `useTheme` + `ThemeProvider`. Toggle visible avec icône Sun/Moon (lucide).

---

## 3. Audit du plan — trous, incohérences, risques

### 3.1 Risques techniques

| # | Risque | Impact | Mitigation |
|---|--------|--------|------------|
| R1 | **Tailwind CSS v4** : config CSS-first, pas de `tailwind.config.js` par défaut. Les tokens Merenza doivent être déclarés via `@theme` ou variables CSS. | Moyen | Utiliser `@theme` dans `globals.css` pour mapper les tokens `--mrz-*` aux utilitaires Tailwind. Tester tôt. |
| R2 | **Next.js 16** : `params` des Route Handlers dynamiques est maintenant une `Promise` (async). `await params` obligatoire. | Moyen | Bien typer `Promise<{ id: string }>`. Tests d'intégration couvrent ce cas. |
| R3 | **better-sqlite3** : compilation native. En CI, nécessite build-tools (python3, make, g++). | Faible | GitHub Actions Ubuntu runner les inclut. Documenter dans README. |
| R4 | **Zod v4** : API partiellement différente de v3 (ex. `.string()` retourne `ZodString`, messages d'erreur). | Faible | Utiliser la syntaxe Zod v4. Tests valident le comportement. |
| R5 | **@dnd-kit + React 19** : compatibilité à vérifier. @dnd-kit n'a pas eu de release majeure récente. | Moyen | Tester un PoC tôt. Fallback : HTML5 Drag & Drop natif si besoin. |
| R6 | **SQLite + Drizzle** : pas de migrations automatiques en dev sans `drizzle-kit`. | Faible | Configurer `drizzle.config.ts`, script `db:migrate` dans package.json. |

### 3.2 Trous / ambiguïtés résolus

| # | Trou | Résolution |
|---|------|------------|
| T1 | Catégorie non définie | Texte libre + suggestions (voir Q1) |
| T2 | Ordre Kanban non spécifié | Champ `position` (voir Q2) |
| T3 | Pas de bib DnD dans la stack | `@dnd-kit/core` + `@dnd-kit/sortable` (voir Q5) |
| T4 | Soft vs hard delete | Hard delete (voir Q6) |
| T5 | Auth | Non requise (voir Q3) |

### 3.3 Incohérences potentielles

| # | Point | Analyse |
|---|-------|---------|
| I1 | Spec dit « Tailwind CSS » sans version. Tailwind v4 est la dernière mais très différente de v3. | Décision : utiliser v4 (dernière stable). Le design system Merenza fonctionne en CSS-first. |
| I2 | Spec dit « Next.js 16.3 LTS ». Next 16.3.0 est bien tagué LTS. | OK, pas d'incohérence. |

---

## 4. User Stories (Gherkin)

Les user stories seront créées en GitHub Issues avec la syntaxe Gherkin (Given/When/Then).
Voir section 5 pour le détail des issues à créer.

### 4.1 US-1 : Créer une tâche
```gherkin
Feature: Créer une tâche
  En tant qu'utilisateur
  Je veux créer une tâche
  Afin de ne pas oublier ce que j'ai à faire

  Scenario: Création réussie avec titre uniquement
    Given qu'aucune tâche n'existe
    When je crée une tâche avec le titre "Acheter du lait"
    Then la tâche existe avec le statut "todo" et la priorité "medium"

  Scenario: Création avec tous les champs
    Given qu'aucune tâche n'existe
    When je crée une tâche avec le titre "Rapport Q3" et la description "Finaliser le rapport" et la priorité "high" et la catégorie "Travail" et la date d'échéance "2026-08-15"
    Then la tâche existe avec tous les champs renseignés

  Scenario Outline: Validation — titre requis
    When je crée une tâche avec le titre "<titre>"
    Then la création échoue avec une erreur 400
    Examples:
      | titre |
      | ""    |
      | "   " |
```

### 4.2 US-2 : Lister et filtrer les tâches
```gherkin
Feature: Filtrer les tâches
  Scenario: Filtrer par priorité
    Given des tâches de priorités "low", "medium", "high"
    When je filtre par priorité "high"
    Then je ne vois que les tâches de priorité "high"

  Scenario: Recherche texte
    Given une tâche "Acheter du lait" et une tâche "Rapport Q3"
    When je cherche "lait"
    Then je ne vois que "Acheter du lait"
```

### 4.3 US-3 : Modifier une tâche
### 4.4 US-4 : Supprimer une tâche
### 4.5 US-5 : Kanban drag & drop
### 4.6 US-6 : Theme dark/light

*(détail complet dans les issues GitHub — section 5)*

---

## 5. Issues GitHub à créer

| Issue | Titre | Labels | US |
|-------|-------|--------|----|
| #7 | US-1 : CRUD — Créer une tâche (API) | user-story, ready-for-dev | US-1 |
| #8 | US-1 : CRUD — Créer une tâche (UI) | user-story | US-1 |
| #9 | US-2 : Lister et filtrer les tâches (API) | user-story, ready-for-dev | US-2 |
| #10 | US-2 : Filtres avancés (UI) | user-story | US-2 |
| #11 | US-3 : Modifier une tâche (API + UI) | user-story | US-3 |
| #12 | US-4 : Supprimer une tâche (API + UI) | user-story | US-4 |
| #13 | US-5 : Kanban drag & drop | user-story | US-5 |
| #14 | US-6 : Theme dark/light | user-story | US-6 |
| #15 | TECH : Design System Merenza | feature, ready-for-dev | — |
| #16 | TECH : Init projet + CI | feature, ready-for-dev | — |
| #17 | TECH : Setup DB + Drizzle migrations | feature | — |

---

## 6. Plan d'implémentation (TDD, une issue à la fois)

Ordre des issues à implémenter :

1. **#16** — Init projet + CI (squelette Next, TS, Vitest, Tailwind v4, CI GitHub Actions)
2. **#17** — Setup DB + Drizzle (schéma, migrations, seed)
3. **#15** — Design System Merenza (tokens, 6 composants, ThemeProvider)
4. **#7** — API : Créer une tâche (TDD : test route POST → implémentation)
5. **#9** — API : Lister + filtrer (TDD : test route GET avec query params)
6. **#8** — UI : Formulaire de création
7. **#10** — UI : Liste + filtres
8. **#11** — Modifier une tâche (API + UI, TDD)
9. **#12** — Supprimer une tâche (API + UI, TDD)
10. **#13** — Kanban drag & drop
11. **#14** — Theme dark/light (toggle + persistance)
12. **Final** — README, JSDoc, nettoyage, tests E2E optionnels

---

## 7. Définition de Done (DoD)

Une issue est terminée quand :
- [ ] Tests écrits en premier (RED)
- [ ] Tests passent (GREEN)
- [ ] Code refactorisé (REFACTOR)
- [ ] Pas de warning TypeScript (`tsc --noEmit`)
- [ ] Pas d'erreur de lint (`eslint`)
- [ ] PR ouverte et liée à l'issue
- [ ] README mis à jour si nécessaire
- [ ] Kanban à jour