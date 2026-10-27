-- Applied on every start, so every statement is IF NOT EXISTS.
-- Times are Unix milliseconds.

-- Short links. `source` is the path after the domain: /<source>.
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL UNIQUE CHECK (length(source) BETWEEN 1 AND 255),
  destination TEXT NOT NULL CHECK (length(destination) BETWEEN 1 AND 2048),
  description TEXT,
  position INTEGER,
  visible INTEGER NOT NULL DEFAULT 1 CHECK (visible IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Totals from the old database up to 2026-10-27 (bots included, no
-- dates), imported once and never written after.
CREATE TABLE IF NOT EXISTS legacy_clicks (
  link_id INTEGER PRIMARY KEY REFERENCES links (id) ON DELETE CASCADE,
  clicks INTEGER NOT NULL CHECK (clicks >= 0)
);

-- Raw Referer header per link from the old database, 'direct' if none.
CREATE TABLE IF NOT EXISTS legacy_referrers (
  link_id INTEGER NOT NULL REFERENCES links (id) ON DELETE CASCADE,
  referrer TEXT NOT NULL,
  count INTEGER NOT NULL CHECK (count >= 0),
  PRIMARY KEY (link_id, referrer)
);

-- One row per redirect. No IP address is stored and the visitor hash
-- rotates daily.
CREATE TABLE IF NOT EXISTS click_events (
  id INTEGER PRIMARY KEY,
  link_id INTEGER NOT NULL REFERENCES links (id) ON DELETE CASCADE,
  -- SHA-256 of IP, user agent, UTC date and salt, cut to 16 hex characters.
  visitor_hash TEXT NOT NULL CHECK (length(visitor_hash) = 16),
  -- Normalised source ('Google', 'linkedin.com'); null is direct.
  referrer TEXT CHECK (length(referrer) <= 255),
  -- ISO 3166 alpha-2 from Cloudflare's cf-ipcountry header.
  country TEXT CHECK (country GLOB '[A-Z][A-Z]'),
  browser TEXT,
  os TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  is_bot INTEGER NOT NULL DEFAULT 0 CHECK (is_bot IN (0, 1)),
  -- The service fetching a link preview ('LinkedIn', 'Slack'); always a bot.
  preview_source TEXT CHECK (preview_source IS NULL OR is_bot = 1),
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS click_events_link ON click_events (link_id, created_at);
CREATE INDEX IF NOT EXISTS click_events_time ON click_events (created_at);
