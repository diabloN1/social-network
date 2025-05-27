package repository

import (
	"database/sql"
)

type Repository struct {
	db *sql.DB
}

func New(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) User() *UserRepository {
	return &UserRepository{
		Repository: r,
	}
}

func (r *Repository) Follow() *FollowRepository {
	return &FollowRepository{
		Repository: r,
	}
}

func (r *Repository) Session() *SessionRepository {
	return &SessionRepository{
		Repository: r,
	}
}

func (r *Repository) Category() *CategoryRepository {
	return &CategoryRepository{
		Repository: r,
	}
}

func (r *Repository) Post() *PostRepository {
	return &PostRepository{
		Repository: r,
	}
}

func (r *Repository) PostShare() *PostShareRepository {
	return &PostShareRepository{
		Repository: r,
	}
}

func (r *Repository) Comment() *CommentRepository {
	return &CommentRepository{
		Repository: r,
	}
}

func (r *Repository) Message() *MessageRepository {
	return &MessageRepository{
		Repository: r,
	}
}

func (r *Repository) Reaction() *ReactionRepository {
	return &ReactionRepository{
		Repository: r,
	}
}

func (r *Repository) Group() *GroupRepository {
	return &GroupRepository{
		Repository: r,
	}	
}
