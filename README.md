# Nurbek Alisherov — Portfolio

Personal portfolio site built with React + Vite, with optional Supabase backend for articles.

## Quick Start

```bash
npm install
npm run dev
```

## Supabase Setup (Optional)

The site works without Supabase (uses local data). To enable database-backed articles:

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New Project

### 2. Run the SQL migration
Go to **SQL Editor** in your Supabase dashboard and paste the contents of `supabase-setup.sql`. Hit **Run**.

### 3. Add environment variables
Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in Supabase → Settings → API.

### 4. Restart the dev server
```bash
npm run dev
```

Articles will now load from and save to Supabase.

## Admin Panel

Type `admin` on your keyboard anywhere on the site to access the admin panel.
Password: `nurbek2026`

## Deploy

```bash
npm run build
```

Upload the `dist/` folder to Vercel, Netlify, or any static host.
Set the environment variables in your hosting provider's dashboard.

## GitHub Push

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
