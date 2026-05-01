package handlers

import (
	"net/http"
	"strconv"

	"blog/internal/db"

	"github.com/gin-gonic/gin"
)

// FollowUser 关注用户
func FollowUserHandler(c *gin.Context) {
	targetIDStr := c.Param("id")
	targetID, err := strconv.Atoi(targetIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

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

	if userID == targetID {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "不能关注自己"})
		return
	}

	// 检查目标用户是否存在
	_, err = db.GetUserByID(targetID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "用户不存在"})
		return
	}

	// 检查是否已关注
	isFollowing, err := db.IsFollowing(userID, targetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "检查关注状态失败"})
		return
	}

	if isFollowing {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": "已经关注过了"})
		return
	}

	err = db.FollowUser(userID, targetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "关注失败"})
		return
	}

	followerCount, _ := db.GetFollowerCount(targetID)
	followingCount, _ := db.GetFollowingCount(userID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "关注成功",
		"data": gin.H{
			"is_following":    true,
			"follower_count":  followerCount,
			"following_count": followingCount,
		},
	})
}

// UnfollowUser 取消关注
func UnfollowUserHandler(c *gin.Context) {
	targetIDStr := c.Param("id")
	targetID, err := strconv.Atoi(targetIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

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

	err = db.UnfollowUser(userID, targetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "取消关注失败"})
		return
	}

	followerCount, _ := db.GetFollowerCount(targetID)
	followingCount, _ := db.GetFollowingCount(userID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "取消关注成功",
		"data": gin.H{
			"is_following":    false,
			"follower_count":  followerCount,
			"following_count": followingCount,
		},
	})
}

// GetFollowStatus 获取关注状态
func GetFollowStatus(c *gin.Context) {
	targetIDStr := c.Param("id")
	targetID, err := strconv.Atoi(targetIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

	// 获取粉丝数和关注数
	followerCount, _ := db.GetFollowerCount(targetID)
	followingCount, _ := db.GetFollowingCount(targetID)

	result := gin.H{
		"follower_count":  followerCount,
		"following_count": followingCount,
		"is_following":    false,
	}

	// 检查当前用户是否关注了目标用户（如果已登录）
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
				isFollowing, _ := db.IsFollowing(userID, targetID)
				result["is_following"] = isFollowing
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetUserFollowers 获取用户粉丝列表
func GetUserFollowers(c *gin.Context) {
	id := c.Param("id")
	userID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

	followers, err := db.GetFollowers(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取粉丝列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": followers})
}

// GetUserFollowing 获取用户关注列表
func GetUserFollowing(c *gin.Context) {
	id := c.Param("id")
	userID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

	following, err := db.GetFollowing(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取关注列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": following})
}
