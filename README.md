# rep-assist-ai

Hackathon MVP: a **rep copilot** that turns structured patient context (labs, meds, diagnoses) plus **coverage rules** into an **eligibility / prior-auth / cost / talking-points** brief. Uses **dummy demo data** only—not a clinical system.

## Tech stack

| Layer | Choices |
|--------|---------|
| **Frontend** | [Next.js](https://nextjs.org/) (App Router), React, TypeScript, Tailwind CSS |
| **API** | Next.js Route Handlers — `/api/patients`, `/api/patients/:id`, `/api/evaluate` |
| **Rules engine** | TypeScript modules in `src/lib/rules/` (eligibility / coverage logic) |
| **Database driver** | [`pg`](https://node-postgres.com/) (server-side only) |

### Data & B2B backend ([InsForge](https://insforge.dev/))

This project uses **[InsForge](https://insforge.dev/)** as the **hosted PostgreSQL** provider (B2B backend-as-a-service): connect with a standard `DATABASE_URL`, run the SQL schema/seed, and the app reads/writes demo data through existing Next.js API routes. InsForge also offers auth, storage, edge functions, and a model gateway—this repo only wires **Postgres** for the hackathon MVP; see [InsForge docs](https://insforge.dev/) for the full platform.

Compatible with **any Postgres** if you prefer to swap the connection string.

### AI (optional)

- LLM hook stub in `src/lib/llm/generateSummary.ts` — can be pointed at InsForge **Model Gateway** or another provider later without changing rule output facts.

## Setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your InsForge connection string.
2. Apply schema + seed (from repo root):

   ```bash
   npm run db:seed
   ```

   Alternatively, paste `sql/schema.sql` then `sql/seed.sql` into the InsForge SQL editor.

3. Run the app (from this folder — the one that contains `package.json`):

   ```bash
   npm run dev
   ```

   If your folder layout is `rep-assist-ai/rep-assist-ai/` (extra parent from a zip), either `cd` into the inner project first, or copy `package.root.json` to `../package.json` in the parent folder so `npm run dev` works there too.

## Environment variables

| Variable        | Required | Description                                        |
|----------------|----------|----------------------------------------------------|
| `DATABASE_URL` | Yes      | Postgres connection URI                            |
| `DATABASE_SSL` | No       | Set to `false` for local Postgres without SSL      |

## API routes (for the frontend)

| Method | Path                 | Description                                      |
|--------|----------------------|--------------------------------------------------|
| `GET`  | `/api/patients`      | List patients (dropdowns, cards)                 |
| `GET`  | `/api/patients/:id` | Full merged profile (patient + diseases + meds + tests) |
| `POST` | `/api/evaluate`      | Rule-based brief for `{ patientId, medicationName }` |

### `POST /api/evaluate` body

```json
{
  "patientId": "11111111-1111-1111-1111-111111111101",
  "medicationName": "CardioX"
}
```

Demo medication is **CardioX** (case-insensitive). Response includes `eligibility`, `priorAuthRequired`, `priorAuthLikelihood`, `estimatedMonthlyCost`, `voucherAvailable`, `summary`, `talkingPoints`, and `meta`.

## Repo layout (split with teammate)

- **Backend / data:** `sql/`, `scripts/seed.ts`, `src/lib/db.ts`, `src/lib/queries/`, `src/lib/rules/`, `src/app/api/`
- **Frontend:** `src/app/page.tsx`, `src/components/` (your teammate)

Frontend should call the API routes only—no direct DB access in the browser.

## Next steps

- Wire InsForge [Model Gateway](https://insforge.dev/) (or another model API) in `src/lib/llm/generateSummary.ts` to polish summary/talking points without changing facts.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
