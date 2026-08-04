# Todo Cuba — Projet Next.js (Équipe Cuba 🇨🇺)

> **Équipe assignée** : 🇨🇺 Cuba (OpenHands, carapace)
> **Construit avec DeepSeek** (glm-5.2:cloud) le 2026-08-03.

## Alignement Caraïbes

Ce projet est développé par l'équipe **Cuba** dans le cadre du programme
**AI Teams Caraïbes**. Cuba est une des 3 équipes indépendantes :

| Équipe | Moteur | Modèles | Projet |
|---|---|---|---|
| 🇨🇺 **Cuba** (assignée) | OpenHands | glm-5.2 + qwen3.5:397b | `todo-cuba` (ce repo) |
| 🇭🇹 Haiti | Hermes | minimax + kimi + deepseek | `todo-haiti` |
| 🇬🇫 Guyane | Hermes | 4 modèles A/B | `ai-hirekit` |

**Séparation équipes/projets** : le repo équipe (`ai-team-cuba`) contient les
skills, l'infra et le bot Telegram. Le repo projet (`todo-cuba`, ce repo) contient
le code et les workflows. Le workflow `cuba-loop.yml` SSH vers carapace pour
déclencher les agents OpenHands.

## Mission des agents

1. **Yanet** (PO, glm-5.2) : produit la spec technique (user stories Gherkin,
   API routes, schéma de données, critères d'acceptation) à partir d'une issue GitHub.
2. **Raúl** (Dev, glm-5.2) : implémente le projet en TDD (tests d'abord, code ensuite).
3. **Camila** (Lead, qwen3.5:397b) : review la PR, poste des commentaires actionnables
   et approuve ou demande des changements.

## Workflows GitHub Actions

| Workflow | Rôle |
|---|---|
| `ci.yml` | lint + typecheck + test sur chaque PR |
| `deploy.yml` | déploiement Netlify sur merge main |
| `cuba-loop.yml` | relay commentaires/issues → SSH carapace → agents OpenHands |
| `motherboard.yml` | ajoute les issues au Project V2 "AI Teams Motherboard" |

## Contraintes

- Stack : Next.js 14+ App Router, TypeScript, Tailwind CSS, SQLite local (Better-SQLite3)
  + Drizzle ORM, Vitest + React Testing Library + MSW.
- API-first : toute la logique métier expose des route handlers Next.js.
- TDD strict : chaque feature est accompagnée de tests qui passent.
- Déploiement : Netlify via GitHub Actions.
- Pas de Claude/GPT : utiliser glm-5.2 (Yanet + Raúl), qwen3.5:397b (Camila) via Ollama Cloud.

## Kanban motherboard

https://github.com/users/YoLoADR/projects/4 — Project V2 unifié avec champ `Équipe`.

## Telegram

`/cuba_po`, `/cuba_dev`, `/cuba_lead` pour s'adresser à l'équipe Cuba.