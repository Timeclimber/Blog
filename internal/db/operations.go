package db

import (
	"time"

	"blog/internal/models"
)

// 文章相关操作

// CreateArticle 创建文章
func CreateArticle(article *models.Article) error {
	query := `INSERT INTO articles (title, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
	result, err := DB.Exec(query, article.Title, article.Content, article.UserID, time.Now(), time.Now())
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
	query := `
	SELECT a.id, a.title, a.content, a.user_id, a.created_at, a.updated_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM articles a
	LEFT JOIN users u ON a.user_id = u.id
	WHERE a.id = ?
	`
	row := DB.QueryRow(query, id)

	article := &models.Article{}
	user := &models.User{}
	err := row.Scan(
		&article.ID, &article.Title, &article.Content, &article.UserID, &article.CreatedAt, &article.UpdatedAt,
		&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	article.User = user
	return article, nil
}

// GetAllArticles 获取所有文章
func GetAllArticles() ([]*models.Article, error) {
	query := `
	SELECT a.id, a.title, a.content, a.user_id, a.created_at, a.updated_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM articles a
	LEFT JOIN users u ON a.user_id = u.id
	ORDER BY a.created_at DESC
	`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	articles := []*models.Article{}
	for rows.Next() {
		article := &models.Article{}
		user := &models.User{}
		err := rows.Scan(
			&article.ID, &article.Title, &article.Content, &article.UserID, &article.CreatedAt, &article.UpdatedAt,
			&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		article.User = user
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

// 用户相关操作

// CreateUser 创建用户
func CreateUser(user *models.User) error {
	query := `INSERT INTO users (username, password_hash, email, role, created_at) VALUES (?, ?, ?, ?, ?)`
	result, err := DB.Exec(query, user.Username, user.PasswordHash, user.Email, user.Role, time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	user.ID = int(id)
	return nil
}

// GetUserByUsername 根据用户名获取用户
func GetUserByUsername(username string) (*models.User, error) {
	query := `SELECT id, username, password_hash, email, gender, avatar_url, role, created_at FROM users WHERE username = ?`
	row := DB.QueryRow(query, username)

	user := &models.User{}
	err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByID 根据ID获取用户
func GetUserByID(id int) (*models.User, error) {
	query := `SELECT id, username, password_hash, email, gender, avatar_url, role, created_at FROM users WHERE id = ?`
	row := DB.QueryRow(query, id)

	user := &models.User{}
	err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// UpdateUser 更新用户信息
func UpdateUser(user *models.User) error {
	query := `UPDATE users SET username = ?, email = ?, gender = ?, avatar_url = ? WHERE id = ?`
	_, err := DB.Exec(query, user.Username, user.Email, user.Gender, user.AvatarURL, user.ID)
	return err
}

// UpdateUserPassword 更新用户密码
func UpdateUserPassword(user *models.User) error {
	query := `UPDATE users SET password_hash = ? WHERE id = ?`
	_, err := DB.Exec(query, user.PasswordHash, user.ID)
	return err
}

// GetAllUsers 获取所有用户
func GetAllUsers() ([]*models.User, error) {
	query := `SELECT id, username, password_hash, email, gender, avatar_url, role, created_at FROM users`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []*models.User{}
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

// GetCommentsByUserID 根据用户ID获取评论
func GetCommentsByUserID(userID int) ([]*models.Comment, error) {
	query := `
	SELECT c.id, c.article_id, c.user_id, c.content, c.created_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM comments c
	LEFT JOIN users u ON c.user_id = u.id
	WHERE c.user_id = ?
	ORDER BY c.created_at DESC
	`
	rows, err := DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []*models.Comment{}
	for rows.Next() {
		comment := &models.Comment{}
		user := &models.User{}
		err := rows.Scan(
			&comment.ID, &comment.ArticleID, &comment.UserID, &comment.Content, &comment.CreatedAt,
			&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		comment.User = user
		comments = append(comments, comment)
	}

	return comments, nil
}

// 评论相关操作

// CreateComment 创建评论
func CreateComment(comment *models.Comment) error {
	query := `INSERT INTO comments (article_id, user_id, content, created_at) VALUES (?, ?, ?, ?)`
	result, err := DB.Exec(query, comment.ArticleID, comment.UserID, comment.Content, time.Now())
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
	query := `
	SELECT c.id, c.article_id, c.user_id, c.content, c.created_at, 
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at 
	FROM comments c
	LEFT JOIN users u ON c.user_id = u.id
	WHERE c.article_id = ? 
	ORDER BY c.created_at DESC
	`
	rows, err := DB.Query(query, articleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []*models.Comment{}
	for rows.Next() {
		comment := &models.Comment{}
		user := &models.User{}
		err := rows.Scan(
			&comment.ID, &comment.ArticleID, &comment.UserID, &comment.Content, &comment.CreatedAt,
			&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		comment.User = user
		comments = append(comments, comment)
	}

	return comments, nil
}

// GetCommentByID 根据ID获取评论
func GetCommentByID(id int) (*models.Comment, error) {
	query := `
	SELECT c.id, c.article_id, c.user_id, c.content, c.created_at, 
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at 
	FROM comments c
	LEFT JOIN users u ON c.user_id = u.id
	WHERE c.id = ?
	`
	row := DB.QueryRow(query, id)

	comment := &models.Comment{}
	user := &models.User{}
	err := row.Scan(
		&comment.ID, &comment.ArticleID, &comment.UserID, &comment.Content, &comment.CreatedAt,
		&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	comment.User = user
	return comment, nil
}

// DeleteComment 删除评论
func DeleteComment(id int) error {
	query := `DELETE FROM comments WHERE id = ?`
	_, err := DB.Exec(query, id)
	return err
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

// 留言板相关操作

// GetAllMessages 获取所有留言
func GetAllMessages() ([]*models.Message, error) {
	query := `SELECT id, name, content, created_at FROM messages ORDER BY created_at DESC`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	messages := []*models.Message{}
	for rows.Next() {
		message := &models.Message{}
		err := rows.Scan(&message.ID, &message.Name, &message.Content, &message.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}

	return messages, nil
}

// CreateMessage 创建新留言
func CreateMessage(name, content string) error {
	query := `INSERT INTO messages (name, content, created_at) VALUES (?, ?, ?)`
	_, err := DB.Exec(query, name, content, time.Now())
	return err
}
