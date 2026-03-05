CREATE TABLE IF NOT EXISTS live_comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path     TEXT NOT NULL,
  css_selector  TEXT,
  pin_x_pct     REAL,
  pin_y_pct     REAL,
  author_name   TEXT NOT NULL,
  body          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comments_page ON live_comments (page_path) WHERE deleted_at IS NULL;
