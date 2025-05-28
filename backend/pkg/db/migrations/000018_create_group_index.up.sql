
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_post_reactions_post_id ON group_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_reactions_user_id ON group_post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_group_comments_post_id ON group_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_group_comments_user_id ON group_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_group ON notifications(receiver_id, group_id);
