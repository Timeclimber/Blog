package handlers

import (
	"net/http"
	"strconv"

	"blog/internal/db"
	"blog/internal/models"

	"github.com/gin-gonic/gin"
)

// CreateTag 创建标签
func CreateTag(c *gin.Context) {
	var tag models.Tag
	if err := c.ShouldBindJSON(&tag); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := db.CreateTag(&tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建标签失败"})
		return
	}

	c.JSON(http.StatusCreated, tag)
}

// GetAllTags 获取所有标签
func GetAllTags(c *gin.Context) {
	tags, err := db.GetAllTags()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取标签列表失败"})
		return
	}

	c.JSON(http.StatusOK, tags)
}

// AddTagToArticle 为文章添加标签
func AddTagToArticle(c *gin.Context) {
	articleIDStr := c.Param("article_id")
	tagIDStr := c.Param("tag_id")

	articleID, err := strconv.Atoi(articleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的文章ID"})
		return
	}

	tagID, err := strconv.Atoi(tagIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的标签ID"})
		return
	}

	err = db.AddTagToArticle(articleID, tagID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "为文章添加标签失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "标签添加成功"})
}

// GetTagsByArticleID 根据文章ID获取标签
func GetTagsByArticleID(c *gin.Context) {
	articleIDStr := c.Param("article_id")
	articleID, err := strconv.Atoi(articleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的文章ID"})
		return
	}

	tags, err := db.GetTagsByArticleID(articleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取文章标签失败"})
		return
	}

	c.JSON(http.StatusOK, tags)
}