CREATE TABLE IF NOT EXISTS group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  inviter_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  is_accepted BOOLEAN NOT NULL,
  is_seen BOOLEAN DEFAULT FALSE,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (inviter_id) REFERENCES users (id),
  FOREIGN KEY (group_id) REFERENCES groups (id)
);
