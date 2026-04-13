package handlers

import (
	"net/http"

	"blog/internal/db"

	"github.com/gin-gonic/gin"
)

// GetMessages 获取所有留言
func GetMessages(c *gin.Context) {
	messages, err := db.GetAllMessages()
	if err != nil {
		c.HTML(http.StatusInternalServerError, "message.html", gin.H{
			"error": "获取留言失败",
		})
		return
	}

	c.HTML(http.StatusOK, "message.html", messages)
}

// CreateMessage 创建新留言
func CreateMessage(c *gin.Context) {
	name := c.PostForm("name")
	content := c.PostForm("content")

	if name == "" || content == "" {
		c.HTML(http.StatusBadRequest, "message.html", gin.H{
			"error": "姓名和留言内容不能为空",
		})
		return
	}

	err := db.CreateMessage(name, content)
	if err != nil {
		c.HTML(http.StatusInternalServerError, "message.html", gin.H{
			"error": "创建留言失败",
		})
		return
	}

	// 重定向回留言板页面
	c.Redirect(http.StatusFound, "/message")
}
