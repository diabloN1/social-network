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
  creation_date DATETIME  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session TEXT,
  expiresAt TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  privacy varchar(50),
  user_id INTEGER,
  caption TEXT,
  image varchar(255),
  creation_date DATETIME  DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS followers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER,
  following_id INTEGER,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (follower_id) REFERENCES users (id),
  FOREIGN KEY (following_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS post_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  shared_with_user_id INTEGER,
  FOREIGN KEY (post_id) REFERENCES posts (id),
  FOREIGN KEY (shared_with_user_id) REFERENCES users (id)
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

CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    inviter_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    is_accepted BOOLEAN NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (inviter_id) REFERENCES users (id),
    FOREIGN KEY (group_id) REFERENCES groups (id)
);

CREATE TABLE IF NOT EXISTS group_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    user_id INTEGER,
    title VARCHAR(255),
    description VARCHAR(255),
    option_1 VARCHAR(255),
    option_2 VARCHAR(255),
    date VARCHAR(255),
    time VARCHAR(255),
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (group_id) REFERENCES groups (id)
);

CREATE TABLE IF NOT EXISTS event_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_going BOOLEAN NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (event_id) REFERENCES group_events (id)
);


CREATE TABLE IF NOT EXISTS post_reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  is_like BOOLEAN,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);


-- INSERT INTO categories VALUES (1, 'Golang'), (2, 'JavaScirpt'), (3, 'Rust'), (4, 'Java');