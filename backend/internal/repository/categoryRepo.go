package repository

import (
	"errors"
	"real-time-forum/internal/model"
)

type CategoryRepository struct {
	Repository *Repository
}

func (r *CategoryRepository) Add(c *model.Category) error {
	return r.Repository.db.QueryRow(
		"INSERT INTO categories (category) VALUES ( ? ) RETURNING id",
		c.Name,
	).Scan(&c.ID)
}

func (r *CategoryRepository) GetAll() ([]*model.Category, error) {
	var categories []*model.Category
	rows, err := r.Repository.db.Query(
		"SELECT id, category FROM categories ORDER BY category ASC",
	)
	if err != nil {
		return nil, errors.New(err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		category := &model.Category{}
		err = rows.Scan(&category.ID, &category.Name)
		if err != nil {
			return nil, errors.New(err.Error())
		}
		categories = append(categories, category)
	}
	if len(categories) == 0 {
		return []*model.Category{}, nil
	}
	return categories, nil
}

func (r *CategoryRepository) GetCategoryById(Id int) (*model.Category, error) {
	row := r.Repository.db.QueryRow("SELECT * FROM categories WHERE  id = ?", Id)
	category := &model.Category{}
	if err := row.Scan(&category.ID, &category.Name); err != nil {
		return nil, errors.New(err.Error())
	}
	return category, nil
}

func (r *CategoryRepository) GetCategoryByName(categoryName string) (*model.Category, error) {
	row := r.Repository.db.QueryRow("SELECT * FROM categories WHERE category = ?", categoryName)
	category := &model.Category{}
	if err := row.Scan(&category.ID, &category.Name); err != nil {
		return nil, errors.New(err.Error())
	}
	return category, nil
}
