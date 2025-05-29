UPDATE users
SET nickname = nickname || '#' || id
WHERE nickname IN (
  SELECT nickname FROM users GROUP BY nickname HAVING COUNT(*) > 1
);

CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email NOT NULL UNIQUE,
  password NOT NULL,
  firstname NOT NULL,
  lastname NOT NULL,
  birth DATE NOT NULL,
  nickname UNIQUE,
  avatar,
  about,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users_new (id, email, password, firstname, lastname, birth, nickname, avatar, about, is_private, creation_date)
SELECT id, email, password, firstname, lastname, birth, nickname, avatar, about, is_private, creation_date FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;
