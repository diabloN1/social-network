CREATE TABLE IF NOT EXISTS post_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  shared_with_user_id INTEGER,
  FOREIGN KEY (post_id) REFERENCES posts (id),
  FOREIGN KEY (shared_with_user_id) REFERENCES users (id)
);
