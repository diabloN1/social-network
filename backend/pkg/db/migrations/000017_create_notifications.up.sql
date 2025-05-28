CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,             
  receiver_id INTEGER NOT NULL,          
  type TEXT NOT NULL,                      --  'follow_request', 'event_created', 'event_response'
group_id INTEGER, 
  is_seen BOOLEAN DEFAULT FALSE,


  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users (id),
  FOREIGN KEY (receiver_id) REFERENCES users (id)
  FOREIGN KEY (group_id) REFERENCES groups(id)  
);
