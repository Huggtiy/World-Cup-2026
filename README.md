# World Cup 2026 Predictor

A real-time prediction web app for the 2026 FIFA World Cup. Compete with your friends by predicting match scores and results across all 104 matches — from the group stage through to the final.

Built with Vite + React 18 + TypeScript + Tailwind CSS v3 + Supabase.

## Live URL

Once deployed, the app will be available at:

```
https://<your-github-username>.github.io/world-cup-2026/
```

## Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) and create a new project.

2. In the Supabase dashboard, navigate to **SQL Editor** and run the full contents of `supabase/schema.sql`. This creates:
   - All tables (`profiles`, `teams`, `matches`, `predictions`)
   - The `leaderboard` view
   - Row-level security policies
   - The `handle_new_user` trigger
   - The `recalculate_match_points` function

3. Navigate to **Settings > API** to find your:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key** — a long JWT string

## GitHub Secrets

Add the following secrets to your GitHub repository under **Settings > Secrets and variables > Actions**:

| Secret name            | Value                              |
|------------------------|------------------------------------|
| `VITE_SUPABASE_URL`    | Your Supabase project URL          |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key    |

These are injected at build time and embedded in the static bundle.

## Local Development

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/world-cup-2026.git
cd world-cup-2026

# 2. Copy the env example and fill in your values
cp .env.example .env
# Edit .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173/world-cup-2026/`.

## Adding Users

Users sign in via **magic link email** — no password required.

To add a user to the group:

1. In Supabase dashboard, go to **Authentication > Users** and invite them by email (click **Invite user**). They will receive a setup email.

2. Once they sign in for the first time, a `profiles` row is created automatically. Set their display name in the **Table Editor** or via SQL:

```sql
UPDATE profiles
SET display_name = 'Alice'
WHERE id = '<user-uuid>';
```

Alternatively, run the following to see all users and set names in bulk:

```sql
SELECT id, display_name FROM profiles ORDER BY created_at;

UPDATE profiles SET display_name = 'Bob' WHERE id = 'xxxxxxxx-...';
UPDATE profiles SET display_name = 'Carol' WHERE id = 'yyyyyyyy-...';
```

## Granting Admin Access

Admins can enter match results, assign knockout bracket teams, and manage user roles. To grant admin access:

```sql
UPDATE profiles
SET is_admin = true
WHERE display_name = 'Alice';
```

Admins see an **Admin** link in the navbar and can access `/admin`.

## Fixture Data Notes

Group stage fixtures are seeded from `src/data/fixtures.ts`. Matches with `verified: true` have confirmed kickoff times and venues. Matches with `verified: false` have **estimated** times/venues that may need updating once the official schedule is released.

Groups with fully verified fixtures: A, B, C (partial), D (partial), F (partial), G (partial), H (partial), I, J, K, L (partial).

Always cross-check with the official FIFA schedule before the tournament starts.

## Scoring Rules

| Scenario | Points |
|---|---|
| Group stage: correct result (W/D/L) | 3 |
| Round of 32: correct team advances | 5 |
| Round of 16: correct team advances | 5 |
| Quarter-final: correct team advances | 8 |
| Semi-final: correct team advances | 12 |
| Third-place play-off: correct winner | 12 |
| Final: correct winner | 20 |
| **Exact score bonus** (any round, stacks) | **+5** |

Maximum points per match:
- Group stage: **8 pts** (3 + 5 exact score bonus)
- Final: **25 pts** (20 + 5 exact score bonus)

## Deployment

The app auto-deploys to GitHub Pages on every push to the `main` branch via GitHub Actions (`.github/workflows/deploy.yml`).

To manually trigger a deployment, go to **Actions > Deploy to GitHub Pages > Run workflow** in your GitHub repository.

Make sure GitHub Pages is configured to use **GitHub Actions** as the source:
1. Go to **Settings > Pages**
2. Under **Source**, select **GitHub Actions**

## Tech Stack

- **Frontend**: Vite 5, React 18, TypeScript 5, Tailwind CSS v3
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Auth**: Magic link email via Supabase Auth
- **Routing**: React Router v6
- **Icons**: lucide-react
- **Date formatting**: date-fns
- **Deploy**: GitHub Pages via GitHub Actions
