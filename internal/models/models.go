package models

import "time"

// Article 文章模型
type Article struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	UserID    int       `json:"user_id"`
	Status    string    `json:"status"` // published 或 draft
	Views     int       `json:"views"`
	LikeCount int       `json:"like_count"`
	IsLiked   bool      `json:"is_liked"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	User      *User     `json:"user,omitempty"`
}

// User 用户模型
type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	Email        string    `json:"email"`
	Gender       string    `json:"gender"` // male, female, other
	AvatarURL    string    `json:"avatar_url"`
	Role         string    `json:"role"` // admin 或 user
	CreatedAt    time.Time `json:"created_at"`
}

// Comment 评论模型
type Comment struct {
	ID        int       `json:"id"`
	ArticleID int       `json:"article_id"`
	UserID    int       `json:"user_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	User      *User     `json:"user,omitempty"`
	Article   *Article  `json:"article,omitempty"`
}

// Tag 标签模型
type Tag struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

// ArticleTag 文章标签关联模型
type ArticleTag struct {
	ArticleID int `json:"article_id"`
	TagID     int `json:"tag_id"`
}

// Message 留言板模型
type Message struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Name      string    `json:"name"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	User      *User     `json:"user,omitempty"`
}

// Like 点赞模型
type Like struct {
	ID        int       `json:"id"`
	ArticleID int       `json:"article_id"`
	UserID    int       `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}
