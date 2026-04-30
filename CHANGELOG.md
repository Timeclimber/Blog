# 版本更新记录

## 3.1.4 (2026-04-30)

### Bug 修复
- **[重要] 修复后端编译错误**
  - 移除了未使用的 `log` 导入
  - 修复了 `ShouldBindJSON` 缺少取地址符号的问题
  - 添加了 `github.com/gin-contrib/cors` 依赖包

### 后端优化
- **CORS配置**：添加了CORS中间件，支持多端口访问（5173-5178）
- **API格式统一**：所有API返回格式统一为 `{success, message, data}`
- **清理代码**：移除了所有调试日志，保持生产环境代码整洁

### 修改文件
- `internal/handlers/user_handler.go` - 统一API格式，移除调试日志，修复编译错误
- `cmd/web/main.go` - 添加CORS中间件
- `go.mod` - 添加gin-contrib/cors依赖
- `go.sum` - 依赖锁文件

## 3.1.3 (2026-04-18)

### 新增功能
- **[重要] 炫酷的自定义箭头光标**
  - 使用 SVG 绘制精美箭头形状，替代传统圆形光标
  - 靛蓝→紫色渐变填充，视觉效果时尚
  - 发光滤镜效果，让光标更有梦幻感
  - 内部半透明白色高光，增加立体感和质感

### UI/UX 改进
- **智能交互反馈**：
  - 悬停在按钮/链接上时光标放大 1.2 倍
  - 点击时光标缩小到 0.9 倍，并有圆圈波纹效果
  - 悬停时在箭头周围显示半透明渐变光环
  - 所有交互都有平滑的过渡动画（150ms）

- **性能优化**：
  - 零动画循环，只在状态变化时渲染
  - 鼠标移动节流（16ms，约 60fps）
  - 代码简洁高效，绝对不卡顿
  - 隐藏系统默认光标，完全使用自定义光标

### 修改文件
- `blog-next/src/components/CursorEffect.tsx` - 全新的箭头光标组件（从圆形升级到箭头）
- `blog-next/src/index.css` - 隐藏系统默认光标
- `blog-next/src/App.tsx` - 集成 CursorEffect 组件

## 3.1.2 (2026-04-17)

### Bug 修复
- **[重要] 修复导航栏头像不实时更新的问题**
  - **问题现象**: 在个人中心修改用户信息（特别是头像 URL）后，右上角导航栏的头像不会实时更新，需要刷新页面才能看到变化
  - **根本原因**: React 组件的 key 属性不够具体，导致组件复用时无法正确响应数据变化
  
  - **解决方案 - 三层保障机制**:
    1. **外层 key（组件级别）**: 给 UserAvatar 组件添加包含 `id`、`username`、`avatar_url` 的复合 key，确保用户信息任何变化都会触发组件完全重新创建
    2. **内层 key（图片级别）**: 给 img 标签添加 `key={user.avatar_url}`，确保头像 URL 变化时强制重新加载新图片
    3. **状态重置机制**: UserAvatar 组件的 useEffect 监听用户信息变化，自动重置 imgError 状态

- **优化 UserAvatar 组件的通用性**
  - 支持所有用户的头像显示（管理员、普通用户）
  - 有头像 URL 时显示自定义头像
  - 无头像 URL 时显示用户名首字母彩色头像
  - 支持 4 种尺寸：sm、md、lg、xl

### 用户体验改进
- **个人中心页面使用统一的 UserAvatar 组件**
  - 替换原来的自定义头像显示逻辑
  - 确保个人中心和导航栏使用相同的头像渲染方式
  - 保持视觉一致性

### 修改文件
- `blog-next/src/components/UserAvatar.tsx` - 添加 img 标签 key，确保图片正确重新加载
- `blog-next/src/components/Navbar.tsx` - 两处 UserAvatar 添加详细的复合 key
- `blog-next/src/pages/Profile.tsx` - 使用 UserAvatar 组件替换自定义头像显示

## 3.1.1 (2026-04-17)

### 导航栏优化
- **新增首页链接**：在导航栏最左侧添加"首页"快捷链接
- **移除重复的写文章按钮**：从下拉菜单中移除"写文章"选项，避免与导航栏上的按钮冲突
- **优化导航结构**：
  - 未登录状态：首页 + 登录/注册
  - 已登录状态：首页 + 写文章 + 用户头像（下拉菜单：个人中心/退出）

### UI 改进
- **用户头像下拉菜单**：
  - 移除写文章选项，保持菜单简洁
  - 只保留个人中心和退出登录两个选项

### 修改文件
- `blog-next/src/components/Navbar.tsx` - 优化导航栏结构和交互

## 3.1.0 (2026-04-17)

### 重大功能更新
- **完整个人中心功能恢复**：
  - 个人信息展示（头像、用户名、邮箱、性别、注册时间）
  - 编辑资料功能（修改用户名、邮箱、性别、头像 URL）
  - 修改密码功能（验证当前密码，设置新密码）
  - 三个标签页导航，切换流畅

- **完整文章管理功能恢复**：
  - 写文章功能（标题、内容输入，好看的表单设计）
  - 首页文章列表（显示作者头像、发布时间、删除按钮）
  - 文章详情页（完整内容展示、作者信息、删除文章按钮）

- **完整评论系统恢复**：
  - 发表评论功能（登录用户可发表评论）
  - 评论列表展示（显示评论作者头像、用户名、发布时间）
  - 删除评论功能（只有评论作者和管理员可删除）

### UI/UX 改进
- **新增 Toast 提示弹窗组件**：
  - 支持成功、错误、警告、信息四种类型
  - 每种都有对应的图标和颜色
  - 3 秒自动消失，可手动关闭
  - 动画效果流畅

- **新增 ConfirmDialog 确认对话框组件**：
  - 大图标（警告/成功/信息）
  - 渐变背景和动画效果
  - 双按钮设计（取消/确认）
  - 悬停效果，交互友好

- **页面美化**：
  - 所有页面采用卡片式设计
  - 响应式布局，适配不同屏幕
  - 平滑过渡动画
  - 加载状态动画
  - 空状态友好提示

### 后端修复
- **统一 API 响应格式**：
  - 文章相关 API（创建、获取、更新、删除）统一响应格式
  - 评论相关 API（创建、获取、删除）统一响应格式
  - 用户相关 API（获取信息、更新信息、修改密码）统一响应格式
  - 所有接口使用 `{ success: boolean, data?: any, message?: string }` 格式

### 新增文件
- `blog-next/src/components/Toast.tsx` - Toast 提示弹窗组件
- `blog-next/src/components/ConfirmDialog.tsx` - 确认对话框组件

### 修改文件
- `blog-next/src/App.tsx` - 包裹 ToastProvider 和 ConfirmDialogProvider
- `blog-next/src/pages/Home.tsx` - 完善首页文章列表和删除功能
- `blog-next/src/pages/Article.tsx` - 完善文章详情页和评论功能
- `blog-next/src/pages/NewArticle.tsx` - 美化写文章页面
- `blog-next/src/pages/Profile.tsx` - 完善个人中心三个标签页功能
- `internal/handlers/article_handler.go` - 统一文章 API 响应格式
- `internal/handlers/comment_handler.go` - 统一评论 API 响应格式
- `internal/handlers/user_handler.go` - 统一用户 API 响应格式

## 3.0.1 (2026-04-17)

### 项目清理
- **删除冗余文件**：
  - 临时脚本文件（fix-deps.bat, install-deps.bat, setup-and-run.ps1, setup-vite-*.ps1）
  - 编译产物（blog.db, main.exe, web.exe）
  - 调试文档（PERSONAL_INFO_DEBUG_GUIDE.md）
  - 根目录的 package-lock.json（前端项目在 blog-next 目录）

- **删除冗余目录**：
  - `.vite/` - Vite 缓存目录
  - `node_modules/` - 根目录的 node_modules
  - `web-frontend/` - 旧的前端目录

- **文件更新**：
  - `.gitignore` - 修复编码问题，确保正确忽略不需要的文件

### 版本更新
- **提交 package-lock.json**：确保前端依赖版本一致性

## 3.0.0 (2026-04-17)

### 重大变更
- **前端框架升级**：从传统 HTML/CSS/JS 升级到 React + Vite + TypeScript
- **项目结构重构**：使用现代前端架构，分离前后端
- **API 响应格式统一**：所有接口使用 `{ success: boolean, data?: any, message?: string }` 格式

### 功能修复
- **登录后个人中心访问问题**：修复认证中间件和用户信息接口的响应格式
- **前端依赖问题**：解决 Tailwind CSS v4 兼容性问题，降级到 v3.4.17
- **Vite ESM 模块问题**：通过配置调整解决 ESM 加载错误
- **页面标题乱码问题**：修复 index.html 中的标题编码问题

### 技术改进
- **前端现代化**：使用 React 18 + Vite 5 + TypeScript 5
- **路由系统**：使用 React Router v6 实现客户端路由
- **状态管理**：使用 localStorage 存储用户认证信息
- **构建工具**：使用 Vite 提供快速的开发体验

### 修改文件
- `blog-next/package.json` - 前端项目配置和依赖管理
- `blog-next/vite.config.mts` - Vite 构建配置
- `blog-next/src/` - 前端 React 代码
- `internal/handlers/auth_middleware.go` - 统一错误响应格式
- `internal/handlers/user_handler.go` - 统一 API 响应格式

## 2.3.18 (2026-04-16)

### UI 改进
- **个人中心页面添加注销按钮**
  - 在导航栏的用户信息区域添加"退出"链接
  - 点击退出链接清除 localStorage 中的 token 和 user
  - 退出后跳转到首页

### 功能更新
- **个人中心页面**：添加退出登录功能

### 修改文件
- `web/templates/profile.html` - 添加注销按钮和功能

## 2.3.17 (2026-04-16)

### UI 改进
- **写文章页面添加成功提示弹窗**
  - 添加成功提示弹窗 CSS 样式
  - 添加成功图标（绿色圆形背景的 SVG 对勾）
  - 替换写文章页面所有 alert() 调用为 showToast()
  - 页面更新 CSS 版本号到 v2.3.17

### 功能更新
- **写文章页面**：添加成功提示弹窗，替换所有 alert() 调用

### 修改文件
- `web/templates/new.html` - 添加成功提示弹窗和替换 alert()

## 2.3.16 (2026-04-16)

### UI 改进
- **添加自定义成功提示弹窗**
  - 添加成功提示弹窗 CSS 样式（遮罩层、模态框、动画效果）
  - 添加成功图标（绿色圆形背景的 SVG 对勾）
  - 添加标题、消息内容和单个确定按钮
  - 确定按钮绿色悬停效果
  - 弹窗背景渐变、下滑缩放动画效果
  - 点击遮罩层或确定按钮关闭弹窗
  - 支持回调函数，点击确定后执行操作
  - 所有页面更新 CSS 版本号到 v2.3.16

### 功能更新
- **首页**：添加成功提示弹窗，替换所有 alert() 调用
- **文章详情页**：添加成功提示弹窗，替换所有 alert() 调用
- **留言板**：添加成功提示弹窗，替换所有 alert() 调用

### 修改文件
- `web/static/css/style.css` - 添加成功提示弹窗样式
- `web/templates/index.html` - 添加成功提示弹窗和替换 alert()
- `web/templates/article.html` - 添加成功提示弹窗和替换 alert()
- `web/templates/message.html` - 添加成功提示弹窗和替换 alert()

## 2.3.15 (2026-04-16)

### UI 改进
- **替换浏览器原生确认弹窗为自定义弹窗**
  - 添加自定义确认弹窗 CSS 样式（遮罩层、模态框、动画效果）
  - 添加警告图标（SVG）、标题、消息内容和双按钮布局
  - 确认按钮红色悬停效果，取消按钮灰色悬停效果
  - 弹窗背景渐变、下滑缩放动画效果
  - 点击遮罩层或取消按钮关闭弹窗
  - 所有页面更新 CSS 版本号到 v2.3.15

### 功能更新
- **首页**：添加自定义确认弹窗，替换文章删除确认
- **文章详情页**：添加自定义确认弹窗，替换评论删除和文章删除确认
- **留言板**：添加自定义确认弹窗，替换留言删除确认

### 修改文件
- `web/static/css/style.css` - 添加自定义确认弹窗样式
- `web/templates/index.html` - 添加确认弹窗和替换 confirm()
- `web/templates/article.html` - 添加确认弹窗和替换 confirm()
- `web/templates/message.html` - 添加确认弹窗和替换 confirm()

## 2.3.14 (2026-04-16)

### 功能增强
- **留言板添加删除功能**
  - 添加 GetMessageByID() 数据库操作函数
  - 添加 DeleteMessage() 数据库操作函数
  - 添加 DeleteMessage() 处理器，带权限验证
  - 只有留言作者或管理员可以删除留言
  - 新增 API 路由 DELETE /api/messages/:id
  - 前端添加删除按钮（仅作者和管理员可见）
  - 添加删除留言的 JavaScript 逻辑
  - 添加删除按钮的 CSS 样式（红色按钮，悬停效果）
  - 更新 message.html CSS 版本号到 v2.3.14

### 修改文件
- `internal/db/operations.go` - 添加留言删除相关操作
- `internal/handlers/message_handler.go` - 添加删除留言处理器
- `cmd/web/main.go` - 添加 DELETE /api/messages/:id 路由
- `web/templates/message.html` - 添加删除按钮和前端逻辑
- `web/static/css/style.css` - 添加删除按钮样式

## 2.3.13 (2026-04-16)

### Bug 修复
- **修复错误提示框默认显示问题**
  - 修改 `.error-message` 样式，默认 `display: none`
  - 添加 `.error-message.show` 类用于显示错误提示
  - 修改 `.success-message` 样式，默认 `display: none`
  - 添加 `.success-message.show` 类用于显示成功提示
  - 更新留言板 JavaScript，设置错误时添加 show 类
  - 更新登录页面 JavaScript，设置错误时添加 show 类
  - 更新注册页面样式和 JavaScript
  - 更新 message.html CSS 版本号到 v2.3.13

### 修改文件
- `web/static/css/style.css` - 修复 error-message 默认显示
- `web/templates/message.html` - 更新错误提示显示逻辑
- `web/templates/login.html` - 更新错误提示显示逻辑
- `web/templates/register.html` - 更新错误提示显示逻辑

## 2.3.12 (2026-04-16)

### 功能增强
- **留言板显示用户头像和用户名**
  - 更新 Message 模型添加 UserID 和 User 字段
  - 数据库表 messages 添加 user_id 字段和外键关联
  - 更新 GetAllMessages() 使用 LEFT JOIN 查询用户信息
  - 更新 CreateMessage() 添加 user_id 参数
  - 重写 message_handler.go，添加登录验证和用户ID设置
  - 留言板前端使用 AJAX 提交方式（POST /api/messages）
  - 留言显示用户头像（40x40 圆形）和用户名
  - 添加留言板头像和用户信息的 CSS 样式
  - 添加错误提示样式（红色背景）

### 修改文件
- `internal/models/models.go` - 更新 Message 模型
- `internal/db/db.go` - 更新 messages 表结构
- `internal/db/operations.go` - 更新留言数据库操作
- `internal/handlers/message_handler.go` - 重写留言处理器
- `cmd/web/main.go` - 添加 API 路由 POST /api/messages
- `web/templates/message.html` - 更新留言板前端
- `web/static/css/style.css` - 添加留言用户信息样式

## 2.3.9 (2026-04-16)

### UI 改进
- **个人中心页面重新设计**
  - 添加标签页导航（个人信息/编辑资料/修改密码）
  - 默认显示个人信息标签页
  - 点击标签按钮切换不同功能区域
  - 添加标签页切换动画效果
  - 移除重复的标题，界面更简洁
  - 添加标签页的 CSS 样式（悬停/选中状态）

### 修改文件
- `web/templates/profile.html` - 添加标签页导航和切换逻辑
- `web/static/css/style.css` - 添加标签页相关样式

## 2.3.8 (2026-04-16)

### 功能增强
- **添加修改密码功能**
  - 个人中心页面新增修改密码表单
  - 验证当前密码后才能修改新密码
  - 新密码需要确认输入，防止误输
  - 密码使用 bcrypt 安全哈希存储
  - 新增 PUT /api/user/password 路由
  - 新增 UpdateUserPassword 数据库操作函数
  - 新增 UpdatePassword 处理器
  - 前端显示成功/失败提示，3秒后自动消失

### 修改文件
- `web/templates/profile.html` - 添加修改密码表单和前端逻辑
- `internal/handlers/user_handler.go` - 添加修改密码处理器
- `internal/db/operations.go` - 添加更新密码的数据库操作
- `cmd/web/main.go` - 添加修改密码路由

## 2.3.7 (2026-04-16)

### 功能增强
- **添加文章删除功能**
  - 新增 `Article` 模型添加 `UserID` 和 `User` 字段
  - 数据库表 `articles` 添加 `user_id` 字段，关联用户信息
  - 更新数据库查询函数，添加 LEFT JOIN 获取文章作者信息
  - 完善文章删除权限验证：仅文章作者和管理员可删除
  - 首页文章列表显示作者头像和用户名
  - 首页添加文章删除按钮（仅作者和管理员可见）
  - 文章详情页添加文章删除按钮（仅作者和管理员可见）
  - 删除按钮点击确认，防止误操作

### 修改文件
- `internal/models/models.go` - 文章模型添加UserID和User字段
- `internal/db/db.go` - 数据库表添加user_id字段
- `internal/db/operations.go` - 更新文章相关数据库操作
- `internal/handlers/article_handler.go` - 完善文章创建、更新、删除权限验证
- `web/templates/index.html` - 首页添加作者信息和删除按钮
- `web/templates/article.html` - 文章详情页添加删除按钮
- `web/static/css/style.css` - 添加文章作者信息和删除按钮样式

## 2.3.6 (2026-04-16)

### 功能增强
- **添加评论删除功能**
  - 新增 `GetCommentByID` 和 `DeleteComment` 数据库操作函数
  - 新增 `DeleteComment` 处理器，带权限验证
  - 新增 `DELETE /api/comments/:id` 路由
  - 前端显示删除按钮（仅评论作者和管理员可见）
  - 删除按钮点击确认，防止误操作
  - 删除成功后自动刷新页面

### 修改文件
- `internal/db/operations.go` - 添加评论删除相关数据库操作
- `internal/handlers/comment_handler.go` - 添加删除评论处理器
- `cmd/web/main.go` - 添加删除评论路由
- `web/templates/article.html` - 添加删除按钮和前端逻辑
- `web/static/css/style.css` - 添加删除按钮样式

## 2.3.5 (2026-04-16)

### 功能修复
- **修复评论不显示用户信息问题**
  - 修复 `GetCommentsByArticleID` 数据库查询缺少 `gender` 和 `avatar_url` 字段
  - 更新前端 `article.html` 显示评论用户头像和用户名
  - 添加评论用户信息的 CSS 样式，提升视觉效果

### 修改文件
- `internal/db/operations.go` - 修复评论查询缺少的字段
- `web/templates/article.html` - 添加评论用户信息显示
- `web/static/css/style.css` - 添加评论用户信息样式

## 2.3.4 (2026-04-16)

### 功能修复
- **修复文章详情页404问题**
  - 修正首页文章链接从 `/article?id=xxx` 到 `/article.html?id=xxx`
  - 修复路由与链接不匹配导致的404错误

### 修改文件
- `web/templates/index.html` - 修正文章详情页链接

## 2.3.3 (2026-04-16)

### 功能修复
- **修复发表文章无权限问题**
  - 移除 `POST /api/articles` 路由中的 `AdminMiddleware()` 限制
  - 移除 `PUT /api/articles/detail/:id` 路由中的 `AdminMiddleware()` 限制
  - 移除 `DELETE /api/articles/detail/:id` 路由中的 `AdminMiddleware()` 限制
  - 现在所有登录用户都可以创建、编辑和删除文章

### 修改文件
- `cmd/web/main.go` - 移除文章操作的管理员权限限制

## 2.3.2 (2026-04-16)

### 仓库清理
- **从 git 历史中删除不该上传的文件**
  - 删除 git 跟踪的数据库文件 `blog.db`
  - 删除 git 跟踪的可执行文件 `blog.exe` 和 `main.exe`
  - 添加 `.gitignore` 文件，防止数据库、编译产物、临时文件等被提交
  - 强制推送到远端清理远程仓库

### 修改文件
- `.gitignore` - 新增，忽略数据库、编译产物等敏感文件

## 1.0.0 (2026-04-12)

### 新增功能
- 实现了本地个人博客系统
- 支持文章管理（创建、查看）
- 支持评论系统（为文章添加评论）
- 支持标签系统（为文章添加标签）
- 实现了数据持久化（使用JSON文件存储）

### 项目结构
- 创建了完整的项目目录结构
- 实现了前端模板和静态文件
- 实现了后端逻辑

## 1.0.1 (2026-04-12)

### 修复问题
- 修复了发布文章按钮不工作的问题
- 将前端表单提交方式从Fetch API改为标准表单提交
- 移除了不必要的JavaScript文件引用

### 改进
- 优化了表单提交流程
- 确保了数据能够正确保存到本地JSON文件

## 1.1.0 (2026-04-13)

### 新增功能
- 添加了留言板功能
- 支持用户在留言板上发布留言
- 支持查看所有留言
- 留言数据持久化到本地JSON文件

### 改进
- 更新了所有页面的导航栏，添加了留言板链接
- 添加了留言板的CSS样式

## 2.0.0 (2026-04-14)

### 新增功能
- **用户登录系统**
  - 实现了完整的用户注册和登录功能
  - 使用JWT进行会话管理和身份验证
  - 基于角色的权限控制（普通用户/管理员）
  - 密码使用bcrypt安全哈希存储
  - 创建默认管理员账户（admin/admin123）

- **数据库升级**
  - 从JSON文件存储迁移到SQLite数据库
  - 添加了用户表（users）支持完整用户管理
  - 添加了留言板表（messages）独立存储留言数据
  - 优化了数据库索引提升查询性能

- **API接口完善**
  - 用户相关：/api/register, /api/login, /api/user
  - 文章CRUD接口（需要管理员权限）
  - 评论发表接口（需要登录）
  - 标签管理接口（需要管理员权限）

### UI/UX改进
- **简约时尚风格重设计**
  - 采用现代简约设计语言
  - 白色背景配合深蓝色主色调
  - 卡片式布局设计
  - 平滑过渡动画效果
  - 响应式布局适配移动端

- **导航栏优化**
  - 固定在页面顶部，不随滚动消失
  - 采用垂直布局：标题在上方，导航菜单在下方
  - 所有内容居中对齐
  - 统一所有页面的导航栏样式

- **页面间距优化**
  - 调整主内容区域顶部边距，避免被固定导航栏遮挡
  - 登录注册页面增加额外边距确保内容可见
  - 删除重复CSS定义解决样式冲突

### 功能增强
- **留言板功能完善**
  - 创建独立的Message数据模型
  - 数据库操作函数（GetAllMessages/CreateMessage）
  - 独立的消息处理器（message_handler.go）
  - GET/POST路由支持查看和提交留言

- **前端交互优化**
  - 登录成功后自动跳转首页
  - 注册成功后自动跳转登录页
  - 表单验证和错误提示
  - Token本地存储保持登录状态

### 技术改进
- 使用Gin框架重构后端架构
- 引入JWT认证中间件
- 引入管理员权限中间件
- 模块化代码结构清晰分层
- CSS工具类便于维护扩展

## 2.1.0 (2026-04-14)

### 新增功能
- **个人中心系统**
  - 新增用户个人信息管理页面（/profile）
  - 支持用户头像显示（默认使用小灰人头像）
  - 支持编辑和保存用户信息（用户名、邮箱、性别、头像URL）
  - 新增"我的评论"历史查看功能
  - 导航栏登录后显示用户头像和用户名

### 问题修复
- **个人信息显示问题**
  - 修复个人信息页面不正确显示的问题
  - 增强前端错误处理和数据验证机制
  - 修复用户ID类型转换问题（兼容int、float64、int64）
  - 修复导航栏覆盖页面内容的布局问题

### 技术改进
- **调试系统增强**
  - 为GetCurrentUser API添加详细的调试日志输出
  - 为前端loadUserInfo函数添加完整的控制台日志
  - 新增API调试工具页面（/debug）方便开发者测试
  - 创建个人信息调试指南文档

- **后端优化**
  - 优化JWT认证中间件的错误处理
  - 完善数据库查询性能
  - 增强API返回数据的完整性和一致性
  - 添加类型安全的用户ID提取机制

- **前端优化**
  - 增强表单验证和实时反馈
  - 优化数据加载状态提示
  - 改进错误信息的展示方式
  - 确保保存操作后界面同步更新

### 新增文件
- `web/templates/profile.html` - 个人中心页面模板
- `web/templates/debug.html` - API调试工具页面
- `PERSONAL_INFO_DEBUG_GUIDE.md` - 个人信息问题诊断指南

### 修改文件
- `internal/handlers/user_handler.go` - 增强用户信息API，添加详细调试日志
- `internal/models/models.go` - 扩展用户模型支持更多信息字段
- `internal/db/operations.go` - 新增GetUserByID等用户查询函数
- `web/static/css/style.css` - 添加个人中心相关样式
- `cmd/web/main.go` - 添加profile和debug路由

## 2.2.0 (2026-04-15)

### 问题修复（严重Bug修复）
- **[严重] comment_handler.go 类型转换不安全**
  - 修复直接使用 `int(userMap["id"].(float64))` 导致的潜在panic问题
  - 使用 type switch 安全处理 int、float64、int64 多种类型
  - 增加类型检查和错误返回机制

- **[严重] 首页文章列表不显示**
  - 修复首页路由返回空模板导致永远显示"暂无文章"
  - 现在从数据库查询文章数据并正确传递给模板渲染

- **[严重] 文章详情页无法显示内容**
  - 修复文章详情页返回空模板的问题
  - 实现完整的文章ID解析、数据库查询逻辑
  - 正确传递文章、评论、标签数据给模板

- **[严重] 评论提交功能不工作**
  - 将评论表单从传统POST改为AJAX提交到 `/api/comments`
  - 添加Token验证和登录状态检查
  - 增加错误提示和成功反馈

- **[中等] 写文章功能不工作**
  - 将写文章表单从传统POST改为AJAX提交到 `/api/articles`
  - 添加管理员权限验证
  - 增加表单验证和错误提示

### 代码清理
- 删除冗余的旧版代码文件：
  - `main.go` (旧版net/http实现)
  - `simple_blog.go` (JSON存储版本)
  - `blog.exe`, `main.exe` (编译产物)
  - `blog_data.json` (旧的JSON数据文件)
- 统一版本记录文档，合并RELEASE_NOTES.md到CHANGELOG.md

### 修改文件
- `internal/handlers/comment_handler.go` - 安全的类型转换机制
- `cmd/web/main.go` - 首页和文章详情页数据传递逻辑
- `web/templates/article.html` - 评论AJAX提交功能
- `web/templates/new.html` - 写文章AJAX提交功能

## 2.2.1 (2026-04-15)

### 问题修复
- **[严重] 个人信息页面显示为空（所有字段显示"-"）**
  - **根本原因**: 用户未登录或Token已过期，但页面仍显示空的个人信息区域
  - **解决方案**:
    - 添加未登录状态的友好提示界面
    - 改进登录检查逻辑，不再强制跳转而是显示提示
    - 处理API返回401错误的情况，自动清除无效Token
    - 添加登录和注册按钮引导用户操作

### 用户体验改进
- **未登录状态处理**
  - 新增 `#login-required` 提示区域，显示友好的登录引导
  - 隐藏个人信息、编辑资料、我的评论等需要登录的区域
  - 提供"立即登录"和"注册新账号"两个快速入口按钮

- **样式优化**
  - 添加 `.login-required` 样式类，居中显示提示信息
  - 添加 `.btn-login` 和 `.btn-register` 按钮样式
  - 使用蓝色和绿色区分登录/注册按钮

### 技术改进
- **前端JavaScript优化**
  - `loadUserInfo()` 函数改进：检测到无Token时显示提示而非跳转
  - API调用增加401状态码处理
  - 错误时自动清除本地存储的Token和用户信息

### 修改文件
- `web/templates/profile.html` - 添加未登录提示区域和改进登录检查
- `web/static/css/style.css` - 添加未登录提示相关样式

## 2.2.2 (2026-04-15)

### 问题修复
- **[严重] 个人中心页面只显示"我的评论"，个人信息和编辑资料不显示**
  - **根本原因**: "我的评论"区域默认显示（无`display:none`），而个人信息区域默认隐藏
  - 当API调用失败或JavaScript出错时，只会看到"我的评论"部分
  
  - **解决方案**:
    - 将"我的评论"区域也设置为默认隐藏（`display: none`）
    - 在用户信息加载成功后，同时显示个人信息、编辑资料和我的评论三个区域
    - 统一处理所有区域的显示/隐藏逻辑
    - 完善错误处理，确保任何错误情况下都正确隐藏所有需要登录的区域

### 布局逻辑优化
- **页面区域显示控制**
  - 未登录状态：只显示"🔒 需要登录"提示，隐藏其他所有区域
  - 登录成功后：依次显示个人信息、编辑资料、我的评论
  - API错误时：显示登录提示，隐藏所有内容区域
  - 网络错误时：同上处理

### 修改文件
- `web/templates/profile.html` - 修复布局逻辑，统一区域显示控制

## 2.2.3 (2026-04-15)

### 紧急问题修复
- **[严重] 个人中心页面点击后完全空白**
  - **根本原因**: 所有区域（个人信息、我的评论）都设置为`display:none`默认隐藏
  - 当JavaScript执行出错或API调用失败时，所有区域保持隐藏状态，导致页面完全空白
  
  - **解决方案**:
    - 将`#profile-info`和`#my-comments`改为**默认显示**
    - 只在明确检测到未登录时才隐藏这些区域
    - 确保即使JavaScript出错，页面也不会完全空白
    - 保持良好的用户体验

### 设计原则改进
- **防御性编程**: 默认显示内容，只在必要时隐藏
- **优雅降级**: 即使JS出错，用户仍能看到基本页面结构
- **用户体验优先**: 避免白屏问题，确保页面始终有内容可读

### 修改文件
- `web/templates/profile.html` - 调整区域默认显示状态

## 2.3.1 (2026-04-16)

### UI 改进
- **页脚固定底部居中显示**
  - 将 footer 设置为 `position: fixed; bottom: 0`，固定在浏览器视口底部
  - 为 body 添加 `padding-bottom: 6rem`，避免内容被 footer 遮挡
  - 添加 `footer p` 样式确保文字内容居中
  - 所有页面 CSS 引用添加版本号 `?v=2.3.1`，强制浏览器刷新缓存

### 修改文件
- `web/static/css/style.css` - 页脚固定底部居中样式
- `web/templates/index.html` - CSS 版本号更新
- `web/templates/login.html` - CSS 版本号更新
- `web/templates/register.html` - CSS 版本号更新
- `web/templates/message.html` - CSS 版本号更新
- `web/templates/article.html` - CSS 版本号更新
- `web/templates/new.html` - CSS 版本号更新
- `web/templates/profile.html` - CSS 版本号更新

## 2.3.0 (2026-04-16)

### 严重问题修复
- **[严重] 登录后个人中心页面仍显示"需要登录"**
  - **根本原因1**: `profile.html` 中 `response` 变量作用域错误
    - 在第二个 `.then(data)` 回调中访问了只在第一个 `.then(response)` 中有效的 `response` 变量
    - 导致 `ReferenceError: response is not defined` 错误
    - JavaScript 执行中断，页面停留在未登录状态
  
  - **根本原因2**: `profile.html` 中有多余的 `});` 导致语法错误
    - 第 377 行有一个多余的括号
    - 导致整个 `<script>` 块语法错误，JavaScript 完全不执行
    - 页面无法进行任何动态操作
  
  - **解决方案**:
    - 修复 `response` 变量作用域问题：在第一个 `.then()` 中检查 401 状态
    - 删除多余的 `});` 语法错误
    - 优化错误处理逻辑，确保 token 验证正确执行

### 技术改进
- **JavaScript 错误处理优化**:
  - 确保 Promise 链正确传递状态
  - 避免变量作用域错误
  - 添加更健壮的错误处理机制

### 修改文件
- `web/templates/profile.html` - 修复 JavaScript 语法和变量作用域错误
