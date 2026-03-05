ALTER TABLE live_comments ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'default';

CREATE INDEX IF NOT EXISTS idx_comments_site ON live_comments (site_id, page_path) WHERE deleted_at IS NULL;
