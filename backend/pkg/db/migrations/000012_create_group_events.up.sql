CREATE TABLE IF NOT EXISTS group_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER,
  user_id INTEGER,
  title TEXT,
  description TEXT,
  option_1 TEXT,
  option_2 TEXT,
  date DATETIME,
  place TEXT,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (group_id) REFERENCES groups (id)
);
