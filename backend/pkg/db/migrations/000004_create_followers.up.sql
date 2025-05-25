CREATE TABLE IF NOT EXISTS followers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER,
  following_id INTEGER,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (follower_id) REFERENCES users (id),
  FOREIGN KEY (following_id) REFERENCES users (id)
);
