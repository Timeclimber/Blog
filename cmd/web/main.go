package main

import (
	"log"

	"blog/internal/db"
	"blog/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化数据库
	err := db.InitDB("./blog.db")
	if err != nil {
		log.Fatalf("数据库初始化失败: %v", err)
	}
	defer db.CloseDB()

	// 创建Gin引擎
	r := gin.Default()

	// 静态文件服务
	r.Static("/static", "./web/static")

	// 模板文件
	r.LoadHTMLGlob("./web/templates/*")

	// API路由
	api := r.Group("/api")
	{
		// 文章相关路由
		api.POST("/articles", handlers.CreateArticle)
		api.GET("/articles", handlers.GetAllArticles)
		api.GET("/articles/:id", handlers.GetArticle)
		api.PUT("/articles/:id", handlers.UpdateArticle)
		api.DELETE("/articles/:id", handlers.DeleteArticle)

		// 评论相关路由
		api.POST("/comments", handlers.CreateComment)
		api.GET("/articles/:article_id/comments", handlers.GetCommentsByArticleID)

		// 标签相关路由
		api.POST("/tags", handlers.CreateTag)
		api.GET("/tags", handlers.GetAllTags)
		api.POST("/articles/:article_id/tags/:tag_id", handlers.AddTagToArticle)
		api.GET("/articles/:article_id/tags", handlers.GetTagsByArticleID)
	}

	// 首页路由
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})

	// 写文章页面
	r.GET("/new", func(c *gin.Context) {
		c.HTML(200, "new.html", nil)
	})

	// 文章详情页面
	r.GET("/article.html", func(c *gin.Context) {
		c.HTML(200, "article.html", nil)
	})

	// 启动服务器
	log.Println("服务器启动在 http://localhost:8080")
	err = r.Run(":8080")
	if err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}