package handlers

import (
	"net/http"
	"strconv"

	"blog/internal/db"

	"github.com/gin-gonic/gin"
)

// LikeArticle 点赞文章
func LikeArticle(c *gin.Context) {
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

	// 检查文章是否存在
	_, err = db.GetArticleByID(articleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "文章不存在"})
		return
	}

	// 检查是否已经点赞
	hasLiked, err := db.HasLiked(articleID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "检查点赞状态失败"})
		return
	}

	if hasLiked {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": "已经点赞过了"})
		return
	}

	// 创建点赞
	err = db.CreateLike(articleID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "点赞失败"})
		return
	}

	// 获取最新点赞数
	likeCount, err := db.GetLikeCount(articleID)
	if err != nil {
		likeCount = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "点赞成功",
		"data": gin.H{
			"like_count": likeCount,
			"is_liked":   true,
		},
	})
}

// UnlikeArticle 取消点赞
func UnlikeArticle(c *gin.Context) {
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

	// 检查是否已经点赞
	hasLiked, err := db.HasLiked(articleID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "检查点赞状态失败"})
		return
	}

	if !hasLiked {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": "还没有点赞"})
		return
	}

	// 删除点赞
	err = db.DeleteLike(articleID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "取消点赞失败"})
		return
	}

	// 获取最新点赞数
	likeCount, err := db.GetLikeCount(articleID)
	if err != nil {
		likeCount = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "取消点赞成功",
		"data": gin.H{
			"like_count": likeCount,
			"is_liked":   false,
		},
	})
}

// GetArticleLikes 获取文章点赞信息
func GetArticleLikes(c *gin.Context) {
	id := c.Param("id")
	articleID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的文章ID"})
		return
	}

	// 检查文章是否存在
	_, err = db.GetArticleByID(articleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "文章不存在"})
		return
	}

	// 获取点赞数
	likeCount, err := db.GetLikeCount(articleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取点赞数失败"})
		return
	}

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
				isLiked, _ = db.HasLiked(articleID, userID)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"like_count": likeCount,
			"is_liked":   isLiked,
		},
	})
}