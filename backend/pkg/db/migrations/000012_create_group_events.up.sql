CREATE TABLE IF NOT EXISTS group_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER,
  user_id INTEGER,
  title VARCHAR(255),
  description VARCHAR(255),
  option_1 VARCHAR(255),
  option_2 VARCHAR(255),
  date DATETIME,
  place VARCHAR(255),
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (group_id) REFERENCES groups (id)
);
