CREATE TABLE IF NOT EXISTS group_message_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER,
  user_id INTEGER,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_seen BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (group_id) REFERENCES groups (id)
);
