CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  google_sub TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS oauth_states (
  state_hash TEXT PRIMARY KEY,
  redirect_path TEXT NOT NULL DEFAULT '/',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  used_at TEXT
);

ALTER TABLE ai_characters ADD COLUMN user_id TEXT;
ALTER TABLE ai_characters ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';
ALTER TABLE ai_conversations ADD COLUMN user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON sessions (user_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at
  ON oauth_states (expires_at);

CREATE INDEX IF NOT EXISTS idx_ai_characters_user_id
  ON ai_characters (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_characters_visibility
  ON ai_characters (visibility, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id
  ON ai_conversations (user_id, created_at DESC);
