package handlers

import (
	"fmt"
	"net/http"

	"blog/internal/db"
	"blog/internal/models"

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

// CreateMessageRequest 创建留言请求
type CreateMessageRequest struct {
	Name    string `json:"name" binding:"required"`
	Content string `json:"content" binding:"required"`
}

// CreateMessage 创建新留言
func CreateMessage(c *gin.Context) {
	var req CreateMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求参数"})
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

	// 创建留言
	err := db.CreateMessage(userID, req.Name, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建留言失败"})
		return
	}

	// 获取完整的留言信息（包含用户信息）
	messages, err := db.GetAllMessages()
	if err != nil {
		c.JSON(http.StatusCreated, gin.H{"message": "留言创建成功"})
		return
	}

	// 找到刚创建的留言
	var newMessage *models.Message
	for _, msg := range messages {
		if msg.Name == req.Name && msg.Content == req.Content {
			newMessage = msg
			break
		}
	}

	if newMessage != nil {
		c.JSON(http.StatusCreated, newMessage)
	} else {
		c.JSON(http.StatusCreated, gin.H{"message": "留言创建成功"})
	}
}

// DeleteMessage 删除留言
func DeleteMessage(c *gin.Context) {
	id := c.Param("id")
	var messageID int
	_, err := fmt.Sscanf(id, "%d", &messageID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的留言ID"})
		return
	}

	// 获取留言
	message, err := db.GetMessageByID(messageID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "留言不存在"})
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

	var currentUserID int
	switch v := userMap["id"].(type) {
	case int:
		currentUserID = v
	case float64:
		currentUserID = int(v)
	case int64:
		currentUserID = int(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "无效的用户ID格式"})
		return
	}

	role, _ := userMap["role"].(string)

	// 验证权限：只有留言作者或管理员可以删除
	if message.UserID != currentUserID && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限删除此留言"})
		return
	}

	// 删除留言
	err = db.DeleteMessage(messageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除留言失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "留言删除成功"})
}
