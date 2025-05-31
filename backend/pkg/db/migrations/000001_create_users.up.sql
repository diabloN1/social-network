CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  birth DATE NOT NULL,
  nickname TEXT UNIQUE,
  avatar TEXT,
  about TEXT,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP
);