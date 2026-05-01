package handlers

import (
	"net/http"
	"strconv"

	"blog/internal/db"

	"github.com/gin-gonic/gin"
)

// BookmarkArticle 收藏文章
func BookmarkArticle(c *gin.Context) {
	id := c.Param("id")
	articleID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的文章ID"})
		return
	}

	// 从上下文中获取用户信息
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未登录"})
		return
	}

	// 提取用户ID
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
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "用户ID类型错误"})
		return
	}

	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

	// 检查文章是否存在
	_, err = db.GetArticleByID(articleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "文章不存在"})
		return
	}

	// 检查是否已经收藏
	hasBookmarked, err := db.HasBookmarked(articleID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "检查收藏状态失败"})
		return
	}

	if hasBookmarked {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": "已经收藏过了"})
		return
	}

	// 创建收藏
	err = db.CreateBookmark(articleID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "收藏失败"})
		return
	}

	// 获取最新收藏数
	bookmarkCount, err := db.GetBookmarkCount(articleID)
	if err != nil {
		bookmarkCount = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "收藏成功",
		"data": gin.H{
			"bookmark_count": bookmarkCount,
			"is_bookmarked":  true,
		},
	})
}

// UnbookmarkArticle 取消收藏
func UnbookmarkArticle(c *gin.Context) {
	id := c.Param("id")
	articleID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的文章ID"})
		return
	}

	// 从上下文中获取用户信息
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未登录"})
		return
	}

	// 提取用户ID
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
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "用户ID类型错误"})
		return
	}

	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

	// 检查是否已经收藏
	hasBookmarked, err := db.HasBookmarked(articleID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "检查收藏状态失败"})
		return
	}

	if !hasBookmarked {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "未收藏过该文章"})
		return
	}

	// 取消收藏
	err = db.DeleteBookmark(articleID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "取消收藏失败"})
		return
	}

	// 获取最新收藏数
	bookmarkCount, err := db.GetBookmarkCount(articleID)
	if err != nil {
		bookmarkCount = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "取消收藏成功",
		"data": gin.H{
			"bookmark_count": bookmarkCount,
			"is_bookmarked":  false,
		},
	})
}
