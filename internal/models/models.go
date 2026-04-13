package models

import "time"

// Article 文章模型
type Article struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Comment 评论模型
type Comment struct {
	ID        int       `json:"id"`
	ArticleID int       `json:"article_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// Tag 标签模型
type Tag struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// ArticleTag 文章标签关联模型
type ArticleTag struct {
	ArticleID int `json:"article_id"`
	TagID     int `json:"tag_id"`
}