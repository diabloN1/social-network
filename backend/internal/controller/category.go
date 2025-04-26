package controller

import (
	"log"
	"real-time-forum/internal/model"
)

func (s *Server) GetCategoryAllData() []*model.Category {
	categories, err := s.repository.Category().GetAll()
	if err != nil {
		log.Println("Error in getting categories:", err)
	}
	for _, category := range categories {
		posts, err := s.repository.Post().GetPostsByCategoryId(category.ID)
		if err != nil {
			log.Println("Error in getting posts for category:", err)
		}

		for _, post := range posts {
			comments, err := s.repository.Comment().GetCommentsByPostId(post.ID)
			if err != nil {
				log.Println("Error in getting comments for post:", err)
			}
			post.Comment = comments
		}
		category.Post = posts
	}
	return categories
}
