CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email varchar(255),
  password varchar(255),
  firstname varchar(255),
  lastname varchar(255),
  birth DATETIME,
  nickname varchar(255),
  avatar varchar(255),
  about varchar(255),
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
