package handlers

import (
	"net/http"
	"strconv"

	"blog/internal/db"

	"github.com/gin-gonic/gin"
)

// GetUserProfile 获取用户公开资料
func GetUserProfile(c *gin.Context) {
	id := c.Param("id")
	userID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

	// 获取用户信息
	user, err := db.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "用户不存在"})
		return
	}

	// 获取用户文章数量
	articles, err := db.GetArticlesByUserID(userID)
	articleCount := 0
	if err == nil {
		articleCount = len(articles)
	}

	// 获取粉丝数和关注数
	followerCount, _ := db.GetFollowerCount(userID)
	followingCount, _ := db.GetFollowingCount(userID)

	// 检查当前用户是否关注了目标用户（如果已登录）
	isFollowing := false
	currentUser, exists := c.Get("user")
	if exists {
		userMap, ok := currentUser.(gin.H)
		if ok {
			var currentID int
			switch v := userMap["id"].(type) {
			case int:
				currentID = v
			case float64:
				currentID = int(v)
			case int64:
				currentID = int(v)
			}

			if currentID > 0 {
				isFollowing, _ = db.IsFollowing(currentID, userID)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":             user.ID,
			"username":       user.Username,
			"email":          user.Email,
			"gender":         user.Gender,
			"avatar_url":     user.AvatarURL,
			"role":           user.Role,
			"created_at":     user.CreatedAt,
			"article_count":  articleCount,
			"follower_count": followerCount,
			"following_count": followingCount,
			"is_following":   isFollowing,
		},
	})
}

// GetUserArticles 获取用户的所有文章
func GetUserArticles(c *gin.Context) {
	id := c.Param("id")
	userID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

	// 检查用户是否存在
	_, err = db.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "用户不存在"})
		return
	}

	// 获取用户的文章
	articles, err := db.GetArticlesByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取文章失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    articles,
	})
}