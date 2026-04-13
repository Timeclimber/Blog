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
		// 用户相关路由
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)
		api.GET("/user", handlers.AuthMiddleware(), handlers.GetCurrentUser)

		// 文章相关路由
		api.GET("/articles", handlers.GetAllArticles)
		api.POST("/articles", handlers.AuthMiddleware(), handlers.AdminMiddleware(), handlers.CreateArticle)
		api.GET("/articles/detail/:id", handlers.GetArticle)
		api.PUT("/articles/detail/:id", handlers.AuthMiddleware(), handlers.AdminMiddleware(), handlers.UpdateArticle)
		api.DELETE("/articles/detail/:id", handlers.AuthMiddleware(), handlers.AdminMiddleware(), handlers.DeleteArticle)

		// 评论相关路由
		api.POST("/comments", handlers.AuthMiddleware(), handlers.CreateComment)
		api.GET("/articles/:article_id/comments", handlers.GetCommentsByArticleID)

		// 标签相关路由
		api.GET("/tags", handlers.GetAllTags)
		api.POST("/tags", handlers.AuthMiddleware(), handlers.AdminMiddleware(), handlers.CreateTag)
		api.GET("/articles/:article_id/tags", handlers.GetTagsByArticleID)
		api.POST("/articles/:article_id/tags/:tag_id", handlers.AuthMiddleware(), handlers.AdminMiddleware(), handlers.AddTagToArticle)
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

	// 启动服务器
	log.Println("服务器启动在 http://localhost:8080")
	err = r.Run(":8080")
	if err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
