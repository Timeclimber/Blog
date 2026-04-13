package db

import (
	"database/sql"
	"time"

	"blog/internal/models"
)

// 文章相关操作

// CreateArticle 创建文章
func CreateArticle(article *models.Article) error {
	query := `INSERT INTO articles (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)`
	result, err := DB.Exec(query, article.Title, article.Content, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	article.ID = int(id)
	return nil
}

// GetArticleByID 根据ID获取文章
func GetArticleByID(id int) (*models.Article, error) {
	query := `SELECT id, title, content, created_at, updated_at FROM articles WHERE id = ?`
	row := DB.QueryRow(query, id)

	article := &models.Article{}
	err := row.Scan(&article.ID, &article.Title, &article.Content, &article.CreatedAt, &article.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return article, nil
}

// GetAllArticles 获取所有文章
func GetAllArticles() ([]*models.Article, error) {
	query := `SELECT id, title, content, created_at, updated_at FROM articles ORDER BY created_at DESC`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	articles := []*models.Article{}
	for rows.Next() {
		article := &models.Article{}
		err := rows.Scan(&article.ID, &article.Title, &article.Content, &article.CreatedAt, &article.UpdatedAt)
		if err != nil {
			return nil, err
		}
		articles = append(articles, article)
	}

	return articles, nil
}

// UpdateArticle 更新文章
func UpdateArticle(article *models.Article) error {
	query := `UPDATE articles SET title = ?, content = ?, updated_at = ? WHERE id = ?`
	_, err := DB.Exec(query, article.Title, article.Content, time.Now(), article.ID)
	return err
}

// DeleteArticle 删除文章
func DeleteArticle(id int) error {
	query := `DELETE FROM articles WHERE id = ?`
	_, err := DB.Exec(query, id)
	return err
}

// 评论相关操作

// CreateComment 创建评论
func CreateComment(comment *models.Comment) error {
	query := `INSERT INTO comments (article_id, content, created_at) VALUES (?, ?, ?)`
	result, err := DB.Exec(query, comment.ArticleID, comment.Content, time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	comment.ID = int(id)
	return nil
}

// GetCommentsByArticleID 根据文章ID获取评论
func GetCommentsByArticleID(articleID int) ([]*models.Comment, error) {
	query := `SELECT id, article_id, content, created_at FROM comments WHERE article_id = ? ORDER BY created_at DESC`
	rows, err := DB.Query(query, articleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []*models.Comment{}
	for rows.Next() {
		comment := &models.Comment{}
		err := rows.Scan(&comment.ID, &comment.ArticleID, &comment.Content, &comment.CreatedAt)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

// 标签相关操作

// CreateTag 创建标签
func CreateTag(tag *models.Tag) error {
	query := `INSERT OR IGNORE INTO tags (name) VALUES (?)`
	result, err := DB.Exec(query, tag.Name)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		// 如果标签已存在，获取其ID
		row := DB.QueryRow(`SELECT id FROM tags WHERE name = ?`, tag.Name)
		err = row.Scan(&tag.ID)
		return err
	}

	tag.ID = int(id)
	return nil
}

// GetAllTags 获取所有标签
func GetAllTags() ([]*models.Tag, error) {
	query := `SELECT id, name FROM tags`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := []*models.Tag{}
	for rows.Next() {
		tag := &models.Tag{}
		err := rows.Scan(&tag.ID, &tag.Name)
		if err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	return tags, nil
}

// AddTagToArticle 为文章添加标签
func AddTagToArticle(articleID, tagID int) error {
	query := `INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`
	_, err := DB.Exec(query, articleID, tagID)
	return err
}

// GetTagsByArticleID 根据文章ID获取标签
func GetTagsByArticleID(articleID int) ([]*models.Tag, error) {
	query := `
	SELECT t.id, t.name FROM tags t
	JOIN article_tags at ON t.id = at.tag_id
	WHERE at.article_id = ?
	`
	rows, err := DB.Query(query, articleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := []*models.Tag{}
	for rows.Next() {
		tag := &models.Tag{}
		err := rows.Scan(&tag.ID, &tag.Name)
		if err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	return tags, nil
}