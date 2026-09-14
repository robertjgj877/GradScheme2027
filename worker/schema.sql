CREATE TABLE IF NOT EXISTS schemes (
  id TEXT PRIMARY KEY,
  employer TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  application_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  start_year INTEGER NOT NULL CHECK(start_year = 2027),
  start_evidence TEXT NOT NULL,
  opened_at TEXT,
  deadline TEXT,
  discovered_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  is_london INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_schemes_active_london ON schemes(is_active, is_london, deadline);

