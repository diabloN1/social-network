ALTER TABLE users RENAME TO users_old;

CREATE TABLE users (
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

INSERT INTO users (id, email, password, firstname, lastname, birth, nickname, avatar, about, is_private, creation_date)
SELECT id, email, password, firstname, lastname, birth, nickname, avatar, about, is_private, creation_date FROM users_old;

DROP TABLE users_old;
