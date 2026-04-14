package handlers

import (
	"net/http"
	"strconv"

	"blog/internal/db"
	"blog/internal/models"

	"github.com/gin-gonic/gin"
)

// CreateComment 创建评论
func CreateComment(c *gin.Context) {
	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 从上下文中获取用户信息
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}

	userMap, ok := user.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取用户信息失败"})
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "无效的用户ID格式"})
		return
	}
	comment.UserID = userID

	err := db.CreateComment(&comment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建评论失败"})
		return
	}

	// 获取完整的评论信息（包含用户信息）
	updatedComment, err := db.GetCommentsByArticleID(comment.ArticleID)
	if err == nil && len(updatedComment) > 0 {
		c.JSON(http.StatusCreated, updatedComment[0])
		return
	}

	c.JSON(http.StatusCreated, comment)
}

// GetCommentsByArticleID 根据文章ID获取评论
func GetCommentsByArticleID(c *gin.Context) {
	articleIDStr := c.Param("article_id")
	articleID, err := strconv.Atoi(articleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的文章ID"})
		return
	}

	comments, err := db.GetCommentsByArticleID(articleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取评论失败"})
		return
	}

	c.JSON(http.StatusOK, comments)
}
