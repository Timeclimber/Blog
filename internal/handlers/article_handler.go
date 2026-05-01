package handlers

import (
	"net/http"
	"strconv"

	"blog/internal/db"
	"blog/internal/models"

	"github.com/gin-gonic/gin"
)

// CreateArticle 创建文章
func CreateArticle(c *gin.Context) {
	var article models.Article
	if err := c.ShouldBindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	// 从上下文中获取用户信息
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未登录"})
		return
	}

	userMap, ok := user.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取用户信息失败"})
		return
	}

	var userID int
	switch v := userMap["id"].(type) {
	case int:
		userID = v
	case float64:
		userID = int(v)
	case int64:
		userID = int(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "无效的用户ID格式"})
		return
	}
	article.UserID = userID

	err := db.CreateArticle(&article)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "创建文章失败"})
		return
	}

	// 获取完整的文章信息（包含用户信息）
	updatedArticle, err := db.GetArticleByID(article.ID)
	if err != nil {
		c.JSON(http.StatusCreated, gin.H{"success": true, "data": article})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": updatedArticle})
}

// GetArticle 获取文章详情
func GetArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的文章ID"})
		return
	}

	article, err := db.GetArticleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "文章不存在"})
		return
	}

	// 增加浏览量（异步，不阻塞响应）
	go db.IncrementArticleViews(id)

	comments, err := db.GetCommentsByArticleID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取评论失败"})
		return
	}

	tags, err := db.GetTagsByArticleID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取标签失败"})
		return
	}

	// 获取点赞数
	likeCount, _ := db.GetLikeCount(id)

	// 检查当前用户是否点赞（如果已登录）
	isLiked := false
	user, exists := c.Get("user")
	if exists {
		userMap, ok := user.(gin.H)
		if ok {
			var userID int
			switch v := userMap["id"].(type) {
			case int:
				userID = v
			case float64:
				userID = int(v)
			case int64:
				userID = int(v)
			}

			if userID > 0 {
				isLiked, _ = db.HasLiked(id, userID)
			}
		}
	}

	// 获取收藏数
	bookmarkCount, _ := db.GetBookmarkCount(id)

	// 检查当前用户是否收藏（如果已登录）
	isBookmarked := false
	if exists {
		userMap, ok := user.(gin.H)
		if ok {
			var userID int
			switch v := userMap["id"].(type) {
			case int:
				userID = v
			case float64:
				userID = int(v)
			case int64:
				userID = int(v)
			}

			if userID > 0 {
				isBookmarked, _ = db.HasBookmarked(id, userID)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"article":         article,
			"comments":        comments,
			"tags":            tags,
			"like_count":      likeCount,
			"is_liked":        isLiked,
			"bookmark_count":  bookmarkCount,
			"is_bookmarked":   isBookmarked,
		},
	})
}

// GetAllArticles 获取所有文章
func GetAllArticles(c *gin.Context) {
	articles, err := db.GetAllArticles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取文章列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": articles})
}

// UpdateArticle 更新文章
func UpdateArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的文章ID"})
		return
	}

	// 获取文章信息
	article, err := db.GetArticleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "文章不存在"})
		return
	}

	// 从上下文中获取用户信息
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未登录"})
		return
	}

	userMap, ok := user.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取用户信息失败"})
		return
	}

	var currentUserID int
	switch v := userMap["id"].(type) {
	case int:
		currentUserID = v
	case float64:
		currentUserID = int(v)
	case int64:
		currentUserID = int(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "无效的用户ID格式"})
		return
	}

	role, _ := userMap["role"].(string)

	// 检查权限：只有文章作者或管理员可以更新
	if currentUserID != article.UserID && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "无权限编辑此文章"})
		return
	}

	var articleData models.Article
	if err := c.ShouldBindJSON(&articleData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	articleData.ID = id
	articleData.UserID = article.UserID
	err = db.UpdateArticle(&articleData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "更新文章失败"})
		return
	}

	// 获取完整的文章信息（包含用户信息）
	updatedArticle, err := db.GetArticleByID(id)
	if err == nil {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": updatedArticle})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": articleData})
}

// DeleteArticle 删除文章
func DeleteArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的文章ID"})
		return
	}

	// 获取文章信息
	article, err := db.GetArticleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "文章不存在"})
		return
	}

	// 从上下文中获取用户信息
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未登录"})
		return
	}

	userMap, ok := user.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取用户信息失败"})
		return
	}

	var currentUserID int
	switch v := userMap["id"].(type) {
	case int:
		currentUserID = v
	case float64:
		currentUserID = int(v)
	case int64:
		currentUserID = int(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "无效的用户ID格式"})
		return
	}

	role, _ := userMap["role"].(string)

	// 检查权限：只有文章作者或管理员可以删除
	if currentUserID != article.UserID && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "无权限删除此文章"})
		return
	}

	err = db.DeleteArticle(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "删除文章失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "文章删除成功"})
}
