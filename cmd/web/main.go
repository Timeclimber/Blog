package main

import (
	"log"
	"strconv"

	"blog/internal/db"
	"blog/internal/handlers"
	"blog/internal/models"

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
		// 用户相关路由
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)
		api.GET("/user", handlers.AuthMiddleware(), handlers.GetCurrentUser)
		api.PUT("/user", handlers.AuthMiddleware(), handlers.UpdateCurrentUser)
		api.PUT("/user/password", handlers.AuthMiddleware(), handlers.UpdatePassword)
		api.GET("/my-comments", handlers.AuthMiddleware(), handlers.GetMyComments)

		// 文章相关路由
		api.GET("/articles", handlers.GetAllArticles)
		api.POST("/articles", handlers.AuthMiddleware(), handlers.CreateArticle)
		api.GET("/articles/detail/:id", handlers.GetArticle)
		api.PUT("/articles/detail/:id", handlers.AuthMiddleware(), handlers.UpdateArticle)
		api.DELETE("/articles/detail/:id", handlers.AuthMiddleware(), handlers.DeleteArticle)

		// 评论相关路由
		api.POST("/comments", handlers.AuthMiddleware(), handlers.CreateComment)
		api.GET("/articles/:article_id/comments", handlers.GetCommentsByArticleID)
		api.DELETE("/comments/:id", handlers.AuthMiddleware(), handlers.DeleteComment)

		// 标签相关路由
		api.GET("/tags", handlers.GetAllTags)
		api.POST("/tags", handlers.AuthMiddleware(), handlers.AdminMiddleware(), handlers.CreateTag)
		api.GET("/articles/:article_id/tags", handlers.GetTagsByArticleID)
		api.POST("/articles/:article_id/tags/:tag_id", handlers.AuthMiddleware(), handlers.AdminMiddleware(), handlers.AddTagToArticle)
	}

	// 首页路由
	r.GET("/", func(c *gin.Context) {
		articles, err := db.GetAllArticles()
		if err != nil {
			articles = []*models.Article{}
		}
		c.HTML(200, "index.html", articles)
	})

	// 写文章页面
	r.GET("/new", func(c *gin.Context) {
		c.HTML(200, "new.html", nil)
	})

	// 文章详情页面
	r.GET("/article.html", func(c *gin.Context) {
		idStr := c.Query("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.HTML(400, "article.html", gin.H{"error": "无效的文章ID"})
			return
		}

		article, err := db.GetArticleByID(id)
		if err != nil {
			c.HTML(404, "article.html", gin.H{"error": "文章不存在"})
			return
		}

		comments, _ := db.GetCommentsByArticleID(id)
		tags, _ := db.GetTagsByArticleID(id)

		c.HTML(200, "article.html", gin.H{
			"Article":  article,
			"Comments": comments,
			"Tags":     tags,
		})
	})

	// 登录页面
	r.GET("/login", func(c *gin.Context) {
		c.HTML(200, "login.html", nil)
	})

	// 注册页面
	r.GET("/register", func(c *gin.Context) {
		c.HTML(200, "register.html", nil)
	})

	// 留言板页面
	r.GET("/message", handlers.GetMessages)
	r.POST("/message", handlers.CreateMessage)

	// 个人中心页面
	r.GET("/profile", func(c *gin.Context) {
		c.HTML(200, "profile.html", nil)
	})

	// 调试页面（开发用，上线前删除）
	r.GET("/debug", func(c *gin.Context) {
		c.HTML(200, "debug.html", nil)
	})

	// 启动服务器
	log.Println("服务器启动在 http://localhost:8080")
	err = r.Run(":8080")
	if err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
