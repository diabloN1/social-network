CREATE TABLE IF NOT EXISTS group_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  group_id INTEGER,
  caption TEXT,
  image varchar(255),
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
