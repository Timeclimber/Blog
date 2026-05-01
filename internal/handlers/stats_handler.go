package handlers

import (
	"fmt"
	"net/http"
	"time"

	"blog/internal/db"

	"github.com/gin-gonic/gin"
)

// GetHotArticles 获取热门文章
func GetHotArticles(c *gin.Context) {
	articles, err := db.GetHotArticles(10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取热门文章失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": articles})
}

// GetSiteStats 获取网站统计信息
func GetSiteStats(c *gin.Context) {
	stats, err := db.GetTotalStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取统计信息失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}

// GetRSSFeed 生成 RSS Feed
func GetRSSFeed(c *gin.Context) {
	articles, err := db.GetAllArticles()
	if err != nil {
		c.String(http.StatusInternalServerError, "获取文章失败")
		return
	}

	rss := `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>博客系统</title>
    <link>http://localhost:8080</link>
    <description>最新文章</description>
    <language>zh-CN</language>
    <lastBuildDate>` + time.Now().Format(time.RFC1123Z) + `</lastBuildDate>
`

	for _, article := range articles {
		rss += fmt.Sprintf(`
    <item>
      <title><![CDATA[%s]]></title>
      <link>http://localhost:8080/article/%d</link>
      <guid>http://localhost:8080/article/%d</guid>
      <description><![CDATA[%s]]></description>
      <pubDate>%s</pubDate>
    </item>
`, article.Title, article.ID, article.ID, article.Content, article.CreatedAt.Format(time.RFC1123Z))
	}

	rss += `
  </channel>
</rss>`

	c.Header("Content-Type", "application/rss+xml; charset=utf-8")
	c.String(http.StatusOK, rss)
}
