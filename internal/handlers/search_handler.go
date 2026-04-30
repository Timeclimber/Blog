package handlers

import (
	"net/http"

	"blog/internal/db"

	"github.com/gin-gonic/gin"
)

// SearchArticles 搜索文章
func SearchArticles(c *gin.Context) {
	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "搜索关键词不能为空"})
		return
	}

	articles, err := db.SearchArticles(keyword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "搜索失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    articles,
	})
}