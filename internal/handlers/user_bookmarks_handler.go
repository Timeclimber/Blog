package handlers

import (
	"net/http"
	"strconv"

	"blog/internal/db"

	"github.com/gin-gonic/gin"
)

// GetUserBookmarks 获取用户收藏的文章
func GetUserBookmarks(c *gin.Context) {
	id := c.Param("id")
	userID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的用户ID"})
		return
	}

	bookmarks, err := db.GetBookmarksByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取收藏列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    bookmarks,
	})
}
