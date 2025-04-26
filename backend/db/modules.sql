CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username varchar(255),
  email varchar(255),
  password varchar(255)
);

CREATE TABLE IF NOT EXISTS personal_data (
  user_id INTEGER,
  firstname varchar(255),
  lastname varchar(255),
  gender varchar(255),
  birth DATETIME,
  FOREIGN KEY(user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session TEXT,
  expiresAt TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category varchar(255) 
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  user_id INTEGER,
  title varchar(255),
  text TEXT,
  creation_date DATETIME  DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories (id)
  FOREIGN KEY (user_id) REFERENCES users (id)
);


CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  post_id INTEGER,
  text TEXT,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (post_id) REFERENCES posts (id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER,
  recipient_id INTEGER,
  is_seen INTEGER DEFAULT 0,
  text TEXT,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users (id),
  FOREIGN KEY (recipient_id) REFERENCES users (id)
);

-- INSERT INTO categories VALUES (1, 'Golang'), (2, 'JavaScirpt'), (3, 'Rust'), (4, 'Java');