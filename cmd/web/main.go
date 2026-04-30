package main

import (
	"log"
	"time"

	"blog/internal/db"
	"blog/internal/handlers"

	"github.com/gin-contrib/cors"
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

	// 配置CORS中间件
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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

		// 留言板相关路由
		api.POST("/messages", handlers.AuthMiddleware(), handlers.CreateMessage)
		api.DELETE("/messages/:id", handlers.AuthMiddleware(), handlers.DeleteMessage)
	}

	// 启动服务器
	log.Println("API 服务器启动在 http://localhost:8080")
	log.Println("请配合 React 前端使用，请访问 http://localhost:5173")
	err = r.Run(":8080")
	if err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}