package db

import (
	"time"

	"blog/internal/models"
)

// 文章相关操作

// CreateArticle 创建文章
func CreateArticle(article *models.Article) error {
	query := `INSERT INTO articles (title, content, user_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := DB.Exec(query, article.Title, article.Content, article.UserID, article.Status, time.Now(), time.Now())
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
	SELECT a.id, a.title, a.content, a.user_id, a.status, a.views, a.created_at, a.updated_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM articles a
	LEFT JOIN users u ON a.user_id = u.id
	WHERE a.id = ?
	`
	row := DB.QueryRow(query, id)

	article := &models.Article{}
	user := &models.User{}
	err := row.Scan(
		&article.ID, &article.Title, &article.Content, &article.UserID, &article.Status, &article.Views, &article.CreatedAt, &article.UpdatedAt,
		&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	article.User = user
	return article, nil
}

// GetAllArticles 获取所有已发布文章
func GetAllArticles() ([]*models.Article, error) {
	query := `
	SELECT a.id, a.title, a.content, a.user_id, a.status, a.views, a.created_at, a.updated_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM articles a
	LEFT JOIN users u ON a.user_id = u.id
	WHERE a.status = 'published'
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
			&article.ID, &article.Title, &article.Content, &article.UserID, &article.Status, &article.Views, &article.CreatedAt, &article.UpdatedAt,
			&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		article.User = user
		articles = append(articles, article)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return articles, nil
}

// GetArticlesByUserID 获取用户的所有文章
func GetArticlesByUserID(userID int) ([]*models.Article, error) {
	query := `
	SELECT a.id, a.title, a.content, a.user_id, a.status, a.views, a.created_at, a.updated_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM articles a
	LEFT JOIN users u ON a.user_id = u.id
	WHERE a.user_id = ? AND a.status = 'published'
	ORDER BY a.created_at DESC
	`
	rows, err := DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	articles := []*models.Article{}
	for rows.Next() {
		article := &models.Article{}
		user := &models.User{}
		err := rows.Scan(
			&article.ID, &article.Title, &article.Content, &article.UserID, &article.Status, &article.Views, &article.CreatedAt, &article.UpdatedAt,
			&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		article.User = user
		articles = append(articles, article)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return articles, nil
}

// SearchArticles 搜索文章
func SearchArticles(keyword string) ([]*models.Article, error) {
	query := `
	SELECT a.id, a.title, a.content, a.user_id, a.status, a.views, a.created_at, a.updated_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM articles a
	LEFT JOIN users u ON a.user_id = u.id
	WHERE a.status = 'published' AND (a.title LIKE ? OR a.content LIKE ?)
	ORDER BY a.created_at DESC
	`
	searchPattern := "%" + keyword + "%"
	rows, err := DB.Query(query, searchPattern, searchPattern)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	articles := []*models.Article{}
	for rows.Next() {
		article := &models.Article{}
		user := &models.User{}
		err := rows.Scan(
			&article.ID, &article.Title, &article.Content, &article.UserID, &article.Status, &article.Views, &article.CreatedAt, &article.UpdatedAt,
			&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		article.User = user
		articles = append(articles, article)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return articles, nil
}

// IncrementArticleViews 增加文章浏览量
func IncrementArticleViews(id int) error {
	query := `UPDATE articles SET views = views + 1 WHERE id = ?`
	_, err := DB.Exec(query, id)
	return err
}

// UpdateArticle 更新文章
func UpdateArticle(article *models.Article) error {
	query := `UPDATE articles SET title = ?, content = ?, status = ?, updated_at = ? WHERE id = ?`
	_, err := DB.Exec(query, article.Title, article.Content, article.Status, time.Now(), article.ID)
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
	query := `INSERT INTO users (username, password_hash, email, gender, avatar_url, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
	result, err := DB.Exec(query, user.Username, user.PasswordHash, user.Email, user.Gender, user.AvatarURL, user.Role, time.Now())
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

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// 评论相关操作

// CreateComment 创建评论
func CreateComment(comment *models.Comment) error {
	query := `INSERT INTO comments (content, user_id, article_id, created_at) VALUES (?, ?, ?, ?)`
	result, err := DB.Exec(query, comment.Content, comment.UserID, comment.ArticleID, time.Now())
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

// GetCommentByID 根据ID获取评论
func GetCommentByID(id int) (*models.Comment, error) {
	query := `
	SELECT c.id, c.content, c.user_id, c.article_id, c.created_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM comments c
	LEFT JOIN users u ON c.user_id = u.id
	WHERE c.id = ?
	`
	row := DB.QueryRow(query, id)

	comment := &models.Comment{}
	user := &models.User{}
	err := row.Scan(
		&comment.ID, &comment.Content, &comment.UserID, &comment.ArticleID, &comment.CreatedAt,
		&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	comment.User = user
	return comment, nil
}

// GetCommentsByArticleID 根据文章ID获取评论
func GetCommentsByArticleID(articleID int) ([]*models.Comment, error) {
	query := `
	SELECT c.id, c.content, c.user_id, c.article_id, c.created_at,
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
			&comment.ID, &comment.Content, &comment.UserID, &comment.ArticleID, &comment.CreatedAt,
			&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		comment.User = user
		comments = append(comments, comment)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}

// GetCommentsByUserID 根据用户ID获取评论
func GetCommentsByUserID(userID int) ([]*models.Comment, error) {
	query := `
	SELECT c.id, c.content, c.user_id, c.article_id, c.created_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at,
	       a.id, a.title
	FROM comments c
	LEFT JOIN users u ON c.user_id = u.id
	LEFT JOIN articles a ON c.article_id = a.id
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
		article := &models.Article{}
		err := rows.Scan(
			&comment.ID, &comment.Content, &comment.UserID, &comment.ArticleID, &comment.CreatedAt,
			&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
			&article.ID, &article.Title,
		)
		if err != nil {
			return nil, err
		}
		comment.User = user
		comment.Article = article
		comments = append(comments, comment)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
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
	query := `INSERT INTO tags (name, created_at) VALUES (?, ?)`
	result, err := DB.Exec(query, tag.Name, time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	tag.ID = int(id)
	return nil
}

// GetAllTags 获取所有标签
func GetAllTags() ([]*models.Tag, error) {
	query := `SELECT id, name, created_at FROM tags ORDER BY name`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := []*models.Tag{}
	for rows.Next() {
		tag := &models.Tag{}
		err := rows.Scan(&tag.ID, &tag.Name, &tag.CreatedAt)
		if err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return tags, nil
}

// GetTagsByArticleID 根据文章ID获取标签
func GetTagsByArticleID(articleID int) ([]*models.Tag, error) {
	query := `
	SELECT t.id, t.name, t.created_at
	FROM tags t
	JOIN article_tags at ON t.id = at.tag_id
	WHERE at.article_id = ?
	ORDER BY t.name
	`
	rows, err := DB.Query(query, articleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := []*models.Tag{}
	for rows.Next() {
		tag := &models.Tag{}
		err := rows.Scan(&tag.ID, &tag.Name, &tag.CreatedAt)
		if err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return tags, nil
}

// AddTagToArticle 为文章添加标签
func AddTagToArticle(articleID, tagID int) error {
	query := `INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)`
	_, err := DB.Exec(query, articleID, tagID)
	return err
}

// 留言板相关操作

// CreateMessage 创建留言
func CreateMessage(userID int, name, content string) (int, error) {
	query := `INSERT INTO messages (user_id, name, content, created_at) VALUES (?, ?, ?, ?)`
	result, err := DB.Exec(query, userID, name, content, time.Now())
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

// GetMessageByID 根据ID获取留言
func GetMessageByID(id int) (*models.Message, error) {
	query := `
	SELECT m.id, m.user_id, m.name, m.content, m.created_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM messages m
	LEFT JOIN users u ON m.user_id = u.id
	WHERE m.id = ?
	`
	row := DB.QueryRow(query, id)

	message := &models.Message{}
	user := &models.User{}
	err := row.Scan(
		&message.ID, &message.UserID, &message.Name, &message.Content, &message.CreatedAt,
		&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	message.User = user
	return message, nil
}

// GetAllMessages 获取所有留言
func GetAllMessages() ([]*models.Message, error) {
	query := `
	SELECT m.id, m.user_id, m.name, m.content, m.created_at,
	       u.id, u.username, u.email, u.gender, u.avatar_url, u.role, u.created_at
	FROM messages m
	LEFT JOIN users u ON m.user_id = u.id
	ORDER BY m.created_at DESC
	`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	messages := []*models.Message{}
	for rows.Next() {
		message := &models.Message{}
		user := &models.User{}
		err := rows.Scan(
			&message.ID, &message.UserID, &message.Name, &message.Content, &message.CreatedAt,
			&user.ID, &user.Username, &user.Email, &user.Gender, &user.AvatarURL, &user.Role, &user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		message.User = user
		messages = append(messages, message)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return messages, nil
}

// DeleteMessage 删除留言
func DeleteMessage(id int) error {
	query := `DELETE FROM messages WHERE id = ?`
	_, err := DB.Exec(query, id)
	return err
}

// 点赞相关操作

// CreateLike 创建点赞
func CreateLike(articleID, userID int) error {
	query := `INSERT INTO likes (article_id, user_id, created_at) VALUES (?, ?, ?)`
	_, err := DB.Exec(query, articleID, userID, time.Now())
	return err
}

// DeleteLike 取消点赞
func DeleteLike(articleID, userID int) error {
	query := `DELETE FROM likes WHERE article_id = ? AND user_id = ?`
	_, err := DB.Exec(query, articleID, userID)
	return err
}

// GetLikeCount 获取文章点赞数
func GetLikeCount(articleID int) (int, error) {
	query := `SELECT COUNT(*) FROM likes WHERE article_id = ?`
	row := DB.QueryRow(query, articleID)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// HasLiked 检查用户是否已点赞
func HasLiked(articleID, userID int) (bool, error) {
	query := `SELECT COUNT(*) FROM likes WHERE article_id = ? AND user_id = ?`
	row := DB.QueryRow(query, articleID, userID)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// CreateBookmark 创建收藏
func CreateBookmark(articleID, userID int) error {
	query := `INSERT INTO bookmarks (article_id, user_id, created_at) VALUES (?, ?, ?)`
	_, err := DB.Exec(query, articleID, userID, time.Now())
	return err
}

// DeleteBookmark 取消收藏
func DeleteBookmark(articleID, userID int) error {
	query := `DELETE FROM bookmarks WHERE article_id = ? AND user_id = ?`
	_, err := DB.Exec(query, articleID, userID)
	return err
}

// GetBookmarkCount 获取文章收藏数
func GetBookmarkCount(articleID int) (int, error) {
	query := `SELECT COUNT(*) FROM bookmarks WHERE article_id = ?`
	row := DB.QueryRow(query, articleID)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// HasBookmarked 检查用户是否已收藏
func HasBookmarked(articleID, userID int) (bool, error) {
	query := `SELECT COUNT(*) FROM bookmarks WHERE article_id = ? AND user_id = ?`
	row := DB.QueryRow(query, articleID, userID)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetBookmarksByUserID 获取用户收藏的文章
func GetBookmarksByUserID(userID int) ([]models.Article, error) {
	query := `
		SELECT a.id, a.title, a.content, a.user_id, a.status, a.views, a.created_at, a.updated_at,
			u.username
		FROM bookmarks b
		JOIN articles a ON b.article_id = a.id
		JOIN users u ON a.user_id = u.id
		WHERE b.user_id = ?
		ORDER BY b.created_at DESC
	`
	rows, err := DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []models.Article
	for rows.Next() {
		var article models.Article
		var username string
		err := rows.Scan(
			&article.ID, &article.Title, &article.Content,
			&article.UserID, &article.Status, &article.Views,
			&article.CreatedAt, &article.UpdatedAt,
			&username,
		)
		if err != nil {
			return nil, err
		}
		article.User = &models.User{
			ID:       article.UserID,
			Username: username,
		}
		articles = append(articles, article)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return articles, nil
}
