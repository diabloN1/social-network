-- Create group_post_reactions table
CREATE TABLE IF NOT EXISTS group_post_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    is_like BOOLEAN NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES group_posts(id) ON DELETE CASCADE,
    UNIQUE(user_id, post_id)
);


