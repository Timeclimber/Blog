# 发版记录

## 版本 1.0.2 - 2026-04-14

### 功能增强
- ✅ 添加用户个人信息管理功能
- ✅ 实现用户头像显示（默认小灰人头像）
- ✅ 支持用户性别、邮箱等信息的编辑和保存
- ✅ 新增个人中心页面（/profile）
- ✅ 添加我的评论历史查看功能

### 问题修复
- ✅ 修复个人信息不显示的问题
- ✅ 增强前端错误处理和数据验证
- ✅ 添加详细的调试日志系统
- ✅ 修复用户ID类型转换问题
- ✅ 修复导航栏覆盖内容的布局问题

### 技术改进
- ✅ 优化JWT认证中间件
- ✅ 增强数据库查询性能
- ✅ 添加API调试工具页面（/debug）
- ✅ 完善错误处理和日志记录

### 新增文件
- `web/templates/profile.html` - 个人中心页面
- `web/templates/debug.html` - API调试工具
- `PERSONAL_INFO_DEBUG_GUIDE.md` - 个人信息调试指南

### 修改文件
- `internal/handlers/user_handler.go` - 增强用户信息API
- `internal/handlers/auth_middleware.go` - 优化认证中间件
- `internal/models/models.go` - 扩展用户模型
- `internal/db/operations.go` - 新增用户信息查询
- `web/static/css/style.css` - 添加个人中心样式
- `cmd/web/main.go` - 添加路由和调试页面

### 前端优化
- ✅ 简约时尚的UI设计
- ✅ 响应式布局
- ✅ 实时错误提示
- ✅ 数据验证和反馈

### 后端优化
- ✅ 类型安全的用户ID处理
- ✅ 完整的错误处理机制
- ✅ 详细的调试日志
- ✅ 数据库操作优化
