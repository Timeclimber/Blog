# 版本更新记录

## 3.1.5 (2026-04-30)

### 文档更新
- **[重要] 重写 README.md**
  - 完全重写 README.md，与当前项目真实状态匹配
  - 添加完整的功能特性说明（用户系统、文章管理、评论系统、留言板、UI/UX 特色）
  - 更新技术栈信息（Go 1.24.2 + React 18 + SQLite）
  - 完善项目结构说明，包含所有组件和页面
  - 添加详细的 API 接口文档（用户认证、文章、评论、标签、留言板）
  - 补充快速开始指南（环境要求、克隆、启动后端、启动前端）

### 修改文件
- `README.md` - 完全重写，173 行新增，50 行删除

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
  - 登录状态：首页 + 写文章 + 用户下拉菜单（个人中心、切换用户、退出登录）

### 新增组件
- **UserAvatar 组件**：
  - 支持自定义头像 URL 和默认首字母头像
  - 4 种尺寸可选（sm、md、lg、xl）
  - 自动处理图片加载失败，回退到首字母头像
  - 彩色背景根据用户名首字母动态生成

- **AuthContext**：
  - 使用 React Context API 管理全局认证状态
  - 提供 login、logout 方法
  - 自动同步 localStorage 和 React 状态

### 修改文件
- `blog-next/src/components/Navbar.tsx` - 重构导航栏，添加首页链接，优化下拉菜单
- `blog-next/src/components/UserAvatar.tsx` - 新增用户头像组件
- `blog-next/src/contexts/AuthContext.tsx` - 新增全局认证状态管理
- `blog-next/src/App.tsx` - 包裹 AuthProvider
- `blog-next/src/pages/Login.tsx` - 登录成功后调用 login() 更新全局状态
- `blog-next/src/pages/Profile.tsx` - 更新信息后同步全局状态
- `internal/handlers/user_handler.go` - 登录时返回完整用户信息

## 3.1.0 (2026-04-17)

### 个人中心功能恢复
- **查看个人信息**：显示用户名、邮箱、性别、头像、角色、注册时间
- **编辑资料**：支持修改用户名、邮箱、性别、头像 URL
  - 实时更新导航栏头像（使用 AuthContext 全局状态）
  - 表单验证和错误提示
- **修改密码**：
  - 需要输入当前密码验证
  - 新密码至少 6 位
  - 密码修改成功后自动退出登录

### 文章管理功能恢复
- **文章列表**：首页显示所有文章，支持删除（作者或管理员）
- **写文章**：支持 Markdown 格式的标题和内容
- **文章详情**：显示文章内容、作者信息、评论列表
- **删除文章**：作者或管理员可以删除文章，带确认对话框

### 评论系统恢复
- **发表评论**：登录用户可以在文章详情页发表评论
- **删除评论**：评论作者或管理员可以删除评论
- **评论列表**：文章详情页显示所有评论

### UI 组件新增
- **Toast 提示弹窗**：
  - 4 种类型（成功、错误、警告、信息）
  - 3 秒自动消失，可手动关闭
  - 精美的渐变背景和图标

- **ConfirmDialog 确认对话框**：
  - 大图标、渐变背景、动画效果
  - 双按钮设计（取消/确认）
  - 支持危险操作提示（红色主题）

### 修改文件
- `blog-next/src/pages/Profile.tsx` - 完全重构个人中心页面
- `blog-next/src/pages/Home.tsx` - 添加文章删除功能
- `blog-next/src/pages/Article.tsx` - 添加评论功能
- `blog-next/src/components/Toast.tsx` - 新增 Toast 组件
- `blog-next/src/components/ConfirmDialog.tsx` - 新增确认对话框组件
- `internal/handlers/user_handler.go` - 完善用户信息更新和密码修改

## 3.0.0 (2026-04-16)

### 项目初始化
- 使用 Go + Gin + SQLite 构建后端 API
- 使用 React + Vite + TypeScript + Tailwind CSS 构建前端
- 实现基础的用户认证（JWT）
- 实现基础的文章 CRUD
- 实现基础的评论功能