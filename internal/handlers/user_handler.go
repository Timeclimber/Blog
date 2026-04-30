package handlers

import (
	"net/http"
	"strings"
	"time"

	"blog/internal/db"
	"blog/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// 密钥，实际生产环境中应该从环境变量获取
var jwtSecret = []byte("your-secret-key")

// RegisterRequest 注册请求

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6"`
	Email    string `json:"email"`
}

// LoginRequest 登录请求

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Claims JWT声明

type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// Register 用户注册
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的请求参数"})
		return
	}

	// 检查用户名是否已存在
	_, err := db.GetUserByUsername(req.Username)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": "用户名已存在"})
		return
	}

	// 哈希密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "密码加密失败"})
		return
	}

	// 如果没有提供email，使用默认值
	email := req.Email
	if email == "" {
		email = req.Username + "@example.com"
	}

	// 创建用户
	user := &models.User{
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		Email:        email,
		Role:         "user", // 默认普通用户
	}

	err = db.CreateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "创建用户失败"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "注册成功",
	})
}

// Login 用户登录
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的请求参数"})
		return
	}

	// 获取用户
	user, err := db.GetUserByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "用户名或密码错误"})
		return
	}

	// 验证密码
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "用户名或密码错误"})
		return
	}

	// 生成JWT token
	claims := Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "生成token失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"token": tokenString,
			"user": gin.H{
				"id":         user.ID,
				"username":   user.Username,
				"email":      user.Email,
				"gender":     user.Gender,
				"avatar_url": user.AvatarURL,
				"role":       user.Role,
				"created_at": user.CreatedAt,
			},
		},
	})
}

// GetCurrentUser 获取当前用户信息
func GetCurrentUser(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未登录"})
		return
	}

	// 从gin.H中提取用户ID
	userMap, ok := user.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取用户信息失败"})
		return
	}

	// 安全地提取用户ID（兼容int和float64两种类型）
	var userID int
	switch v := userMap["id"].(type) {
	case int:
		userID = v
	case float64:
		userID = int(v)
	case int64:
		userID = int(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "无效的用户ID格式"})
		return
	}

	// 从数据库查询完整用户信息
	fullUser, err := db.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "查询用户信息失败"})
		return
	}

	// 返回完整用户信息（不包含密码）
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":         fullUser.ID,
			"username":   fullUser.Username,
			"email":      fullUser.Email,
			"gender":     fullUser.Gender,
			"avatar_url": fullUser.AvatarURL,
			"role":       fullUser.Role,
			"created_at": fullUser.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
	})
}

// UpdateUserRequest 更新用户信息请求
type UpdateUserRequest struct {
	Username  string `json:"username" binding:"required,min=3,max=50"`
	Email     string `json:"email" binding:"required,email"`
	Gender    string `json:"gender"`
	AvatarURL string `json:"avatar_url"`
}

// UpdateCurrentUser 更新当前用户信息
func UpdateCurrentUser(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未登录"})
		return
	}

	// 从gin.H中提取用户ID并查询完整用户对象
	userMap, ok := user.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取用户信息失败"})
		return
	}

	// 安全地提取用户ID（兼容int和float64两种类型）
	var userID int
	switch v := userMap["id"].(type) {
	case int:
		userID = v
	case float64:
		userID = int(v)
	case int64:
		userID = int(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "无效的用户ID格式"})
		return
	}

	currentUser, err := db.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "用户不存在"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的请求参数"})
		return
	}

	// 检查用户名是否被其他用户占用
	existingUser, err := db.GetUserByUsername(req.Username)
	if err == nil && existingUser.ID != currentUser.ID {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": "用户名已被占用"})
		return
	}

	// 更新用户信息
	currentUser.Username = req.Username
	currentUser.Email = req.Email
	currentUser.Gender = req.Gender
	currentUser.AvatarURL = req.AvatarURL

	err = db.UpdateUser(currentUser)
	if err != nil {
		// 检查是否是唯一约束冲突（邮箱已被使用）
		if strings.Contains(err.Error(), "UNIQUE constraint failed") || strings.Contains(err.Error(), "unique") {
			c.JSON(http.StatusConflict, gin.H{"success": false, "message": "该邮箱已被其他用户使用"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "更新用户信息失败"})
		return
	}

	// 返回更新后的用户信息（不包含密码）
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "用户信息更新成功",
		"data": gin.H{
			"id":         currentUser.ID,
			"username":   currentUser.Username,
			"email":      currentUser.Email,
			"gender":     currentUser.Gender,
			"avatar_url": currentUser.AvatarURL,
			"role":       currentUser.Role,
		},
	})
}

// GetMyComments 获取我的评论
func GetMyComments(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未登录"})
		return
	}

	// 从gin.H中提取用户ID
	userMap, ok := user.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取用户信息失败"})
		return
	}

	// 安全地提取用户ID（兼容int和float64两种类型）
	var userID int
	switch v := userMap["id"].(type) {
	case int:
		userID = v
	case float64:
		userID = int(v)
	case int64:
		userID = int(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "无效的用户ID格式"})
		return
	}

	comments, err := db.GetCommentsByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取评论失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    comments,
	})
}

// UpdatePasswordRequest 修改密码请求
type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// UpdatePassword 修改密码
func UpdatePassword(c *gin.Context) {
	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的请求参数"})
		return
	}

	// 从上下文中获取用户信息
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未登录"})
		return
	}

	userMap, ok := user.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "获取用户信息失败"})
		return
	}

	// 安全地提取用户ID
	var userID int
	switch v := userMap["id"].(type) {
	case int:
		userID = v
	case float64:
		userID = int(v)
	case int64:
		userID = int(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "无效的用户ID格式"})
		return
	}

	// 从数据库查询用户
	currentUser, err := db.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "用户不存在"})
		return
	}

	// 验证当前密码
	err = bcrypt.CompareHashAndPassword([]byte(currentUser.PasswordHash), []byte(req.CurrentPassword))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "当前密码不正确"})
		return
	}

	// 哈希新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "密码加密失败"})
		return
	}

	// 更新密码
	currentUser.PasswordHash = string(hashedPassword)
	err = db.UpdateUserPassword(currentUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "更新密码失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "密码修改成功",
	})
}
