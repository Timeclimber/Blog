package models

import "time"

// Article 文章模型
type Article struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	UserID    int       `json:"user_id"`
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

// Message 留言板模型
type Message struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Name      string    `json:"name"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	User      *User     `json:"user,omitempty"`
}
