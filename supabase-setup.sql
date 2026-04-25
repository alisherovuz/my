-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- 1. Create articles table
create table articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  excerpt text not null,
  tag text not null default 'AI / Tech',
  color text not null default '#2563EB',
  year int not null default 2026,
  month text not null default 'January',
  date text not null default 'January 2026',
  created_at timestamp with time zone default now()
);

-- 2. Enable Row Level Security
alter table articles enable row level security;

-- 3. Allow anyone to read articles (public site)
create policy "Anyone can read articles"
  on articles for select
  using (true);

-- 4. Allow inserts/updates/deletes only with service role or anon key
--    (for your admin panel — you can tighten this later with auth)
create policy "Allow all operations for now"
  on articles for all
  using (true)
  with check (true);

-- 5. Seed with your existing articles
insert into articles (title, excerpt, tag, color, year, month, date) values
  ('Why Uzbekistan''s AI Future Starts in the Classroom', 'The gap between what we teach and what the world needs is widening — and Central Asia has a unique opportunity to leapfrog.', 'Education', '#059669', 2026, 'January', 'January 2026'),
  ('Building EduGrands: Lessons from Year One', 'What nobody tells you about building an edtech startup in Central Asia — the honest version.', 'Startups', '#B86200', 2025, 'December', 'December 2025'),
  ('The Mentor''s Paradox', 'Teaching AI to the next generation made me question everything I thought I knew about learning itself.', 'Reflection', '#7C3AED', 2025, 'November', 'November 2025'),
  ('How I Built My First NLP Model for Uzbek', 'A deep dive into the challenges of working with low-resource languages and what I learned along the way.', 'AI / Tech', '#2563EB', 2025, 'October', 'October 2025'),
  ('What Running a Startup Taught Me About Learning', 'The overlap between entrepreneurship and education is bigger than you''d think.', 'Startups', '#B86200', 2025, 'September', 'September 2025'),
  ('On Finding Your Thing Early', 'You don''t need to have it all figured out — but it helps to start looking.', 'Reflection', '#7C3AED', 2025, 'August', 'August 2025');
