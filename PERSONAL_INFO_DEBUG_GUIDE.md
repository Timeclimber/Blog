# 个人信息显示问题 - 诊断指南

## 问题描述
用户反馈：点击个人信息页面后，不显示正确的个人信息（可能显示默认值或旧数据）

## 已实施的修复措施

### 1. 后端调试日志（已添加到 user_handler.go）
在 `GetCurrentUser` 函数中添加了详细的日志输出：

**日志位置：**
- [user_handler.go:150](internal/handlers/user_handler.go#L150) - JWT提取的用户信息
- [user_handler.go:167](internal/handlers/user_handler.go#L167) - 用户ID提取结果
- [user_handler.go:174-181](internal/handlers/user_handler.go#L174-L181) - 数据库查询的完整用户信息
- [user_handler.go:196](internal/handlers/user_handler.go#L196) - API返回给前端的数据

### 2. 前端调试日志（已添加到 profile.html）
在 `loadUserInfo()` 函数中添加了详细的控制台日志：

**日志位置：**
- Token检查和API调用状态
- API返回数据的完整内容
- 每个字段的赋值过程
- 头像、用户名、邮箱、性别、角色、注册时间的处理过程

## 如何使用这些调试信息

### 步骤1：查看服务器终端日志
1. 确保服务器正在运行（应该在 `http://localhost:8080`）
2. 打开浏览器访问 `http://localhost:8080/profile`
3. **查看运行服务器的终端窗口**，你会看到类似这样的输出：

```
🔍 [DEBUG] 从JWT中提取的用户信息: map[id:1 username:admin role:admin]
🔍 [DEBUG] 提取到的用户ID: 1 (类型: int)
✅ [DEBUG] 从数据库查询到的完整用户信息:
   - ID: 1
   - Username: admin
   - Email: admin@example.com
   - Gender: 'male'
   - AvatarURL: 'https://example.com/avatar.jpg'
   - Role: admin
   - CreatedAt: 2026-04-14 08:00:00 +0000 UTC
📤 [DEBUG] API返回给前端的数据: map[avatar_url:https://example.com/avatar.jpg created_at:2026-04-14T08:00:00Z email:admin@example.com gender:male id:1 role:admin username:admin]
```

### 步骤2：查看浏览器控制台
1. 在个人信息页面按 `F12` 或右键选择"检查"
2. 切换到 "Console"（控制台）标签
3. 刷新页面，你会看到类似这样的输出：

```
✅ [前端DEBUG] 开始获取用户信息...
🔑 [前端DEBUG] Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
📡 [前端DEBUG] API响应状态: 200
📦 [前端DEBUG] API返回的完整数据: {id: 1, username: "admin", email: "admin@example.com", ...}
✅ [前端DEBUG] 开始更新页面显示...
🖼️ [前端DEBUG] 头像URL: https://example.com/avatar.jpg
👤 [前端DEBUG] 用户名: admin
📧 [前端DEBUG] 邮箱: admin@example.com
⚧️ [前端DEBUG] 性别原始值: male -> 显示为: 男
👑 [前端DEBUG] 角色原始值: admin -> 显示为: 管理员
📅 [前端DEBUG] 注册时间原始值: 2026-04-14T08:00:00Z -> 格式化为: 2026/4/14 16:00:00
📝 [前端DEBUG] 填充编辑表单...
✅ [前端DEBUG] 用户信息加载完成！
```

## 常见问题排查

### 问题1：数据库字段为空
**现象：** API返回的gender或avatar_url为空字符串
**原因：** 用户从未保存过个人信息，或保存时字段为空
**解决：** 在编辑表单中填写信息并点击保存

### 问题2：API返回错误
**现象：** 控制台显示"❌ [前端DEBUG] API返回错误: ..."
**原因：** Token无效或过期
**解决：** 重新登录获取新的Token

### 问题3：字段显示为默认值
**现象：** 性别显示"其他"，角色显示"普通用户"
**原因：** 数据库中确实存储的就是默认值
**解决：** 检查编辑表单是否正确提交，查看服务器终端的更新日志

## 下一步操作

请执行以下步骤并提供反馈：

1. **访问个人信息页面**：http://localhost:8080/profile
2. **复制服务器终端的所有日志输出**（包含🔍、✅、📤标记的那些行）
3. **复制浏览器控制台的所有日志输出**（包含[前端DEBUG]标记的那些行）
4. **截图或描述页面上实际显示的内容**

有了这些调试信息，我们就能准确定位问题所在！

## 相关文件
- 后端API：[user_handler.go](internal/handlers/user_handler.go)
- 前端页面：[profile.html](web/templates/profile.html)
- 数据库操作：[operations.go](internal/db/operations.go)
- 调试工具页面：http://localhost:8080/debug
