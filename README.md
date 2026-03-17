# HoodDo 🏘️

שוק משימות שכונתי – כיכר רבין / גן דובנוב, תל אביב

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd hooddo
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** and paste the contents of `supabase/schema.sql`.
3. Run it – this creates the `tasks` table, indexes, and RLS policies, and seeds test data.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your values from Supabase → Project Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push your code to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Add the two env vars in Vercel's Project Settings → Environment Variables.
4. Deploy.

---

## Pages

| Path | Description |
|------|-------------|
| `/` | Feed of nearby tasks |
| `/new` | Post a new task |
| `/task/[id]` | Task detail + WhatsApp contact |

---

## Key behavior notes

- **No authentication** – task ownership is inferred by matching saved phone in localStorage.
- **Location** – requested on interaction only, never on page load.
- **Distance** – Haversine formula, client-side only.
- **WhatsApp** – links open directly with a pre-filled Hebrew message.
- **Closing a task** – only shown if your saved phone matches the task's phone.

---

## Project structure

```
app/
  layout.tsx         – Root layout (RTL, Hebrew)
  page.tsx           – Home feed
  new/page.tsx       – New task form
  task/[id]/page.tsx – Task detail
components/
  TaskCard.tsx       – Feed card
utils/
  distance.ts        – Haversine + formatting
  phone.ts           – Normalization + WhatsApp link
  storage.ts         – localStorage helpers
lib/
  supabase.ts        – Client + Task type
supabase/
  schema.sql         – DB schema + seed data
```
