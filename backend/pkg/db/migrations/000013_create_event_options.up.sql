CREATE TABLE IF NOT EXISTS event_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  is_going BOOLEAN NOT NULL,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (event_id) REFERENCES group_events (id)
);
