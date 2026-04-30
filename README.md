# Blog - 全栈博客系统

一个现代化的全栈博客系统，采用 Go + React + SQLite 技术栈，支持文章管理、评论互动、用户认证、留言板等丰富功能。

## 功能特性

### 用户系统
- 用户注册与登录（JWT Token 认证）
- 个人中心（查看/编辑资料、修改密码）
- 用户头像支持（自定义 URL 或默认首字母头像）
- 管理员与普通用户角色区分

### 文章管理
- 创建、查看、编辑、删除文章
- 文章列表展示（支持骨架屏加载）
- 文章详情页（含评论）
- 标签系统（为文章添加分类标签）

### 评论系统
- 文章评论（发表、删除）
- 评论列表展示
- 用户评论历史查看

### 留言板
- 发表留言
- 删除留言

### UI/UX 特色
- 自定义箭头光标（SVG 绘制，渐变发光效果）
- 悬停/点击交互反馈
- Toast 提示弹窗（成功/错误/警告/信息）
- 确认对话框（带渐变背景和动画）
- 骨架屏加载效果
- 响应式设计（适配移动端）

## 技术栈

### 后端
- **语言**: Go 1.24.2
- **Web 框架**: Gin
- **数据库**: SQLite
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt
- **CORS**: gin-contrib/cors

### 前端
- **框架**: React 18.3.1
- **构建工具**: Vite 5.4.21
- **语言**: TypeScript 5.9.3
- **路由**: React Router DOM 6.30.3
- **样式**: Tailwind CSS 3.4.17
- **状态管理**: React Context API (AuthContext)

## 项目结构

```
Blog/
├── blog-next/                  # 前端项目
│   ├── src/
│   │   ├── components/         # 可复用组件
│   │   │   ├── Navbar.tsx      # 导航栏（含用户头像、切换用户）
│   │   │   ├── Toast.tsx       # 提示弹窗组件
│   │   │   ├── ConfirmDialog.tsx # 确认对话框
│   │   │   ├── UserAvatar.tsx  # 用户头像组件
│   │   │   ├── CursorEffect.tsx # 鼠标特效组件
│   │   │   └── Skeleton.tsx    # 骨架屏组件
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # 全局认证状态管理
│   │   ├── pages/              # 页面组件
│   │   │   ├── Home.tsx        # 首页（文章列表）
│   │   │   ├── Login.tsx       # 登录页
│   │   │   ├── Register.tsx    # 注册页（含表单验证）
│   │   │   ├── Profile.tsx     # 个人中心
│   │   │   ├── NewArticle.tsx  # 写文章
│   │   │   ├── Article.tsx     # 文章详情
│   │   │   └── Message.tsx     # 留言板
│   │   ├── App.tsx             # 应用主组件（路由配置）
│   │   ├── main.tsx            # 程序入口
│   │   └── index.css           # 全局样式
│   ├── package.json
│   └── index.html
├── cmd/web/main.go             # 后端入口
├── internal/
│   ├── handlers/               # HTTP 处理器
│   │   ├── user_handler.go     # 用户相关 API
│   │   ├── article_handler.go  # 文章相关 API
│   │   ├── comment_handler.go  # 评论相关 API
│   │   ├── message_handler.go  # 留言板 API
│   │   ├── auth_middleware.go  # JWT 认证中间件
│   │   └── tag_handler.go      # 标签相关 API
│   ├── db/                     # 数据库操作
│   └── models/                 # 数据模型
├── blog.db                     # SQLite 数据库文件
├── go.mod
├── go.sum
├── CHANGELOG.md                # 版本更新记录
└── README.md                   # 项目说明文档
```

## 快速开始

### 环境要求
- Go 1.24.2+
- Node.js 18+
- npm 或 yarn

### 1. 克隆项目

```bash
git clone https://github.com/Timeclimber/Blog.git
cd Blog
```

### 2. 启动后端

```bash
# 安装 Go 依赖
go mod tidy

# 启动后端服务器
go run cmd/web/main.go
```

后端服务将运行在 http://localhost:8080

### 3. 启动前端

```bash
# 进入前端目录
cd blog-next

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将运行在 http://localhost:5173（或自动分配的端口）

### 4. 访问应用

打开浏览器访问前端地址即可使用。

## API 接口

### 用户认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/register | 用户注册 |
| POST | /api/login | 用户登录 |
| GET | /api/user | 获取当前用户信息（需认证） |
| PUT | /api/user | 更新用户信息（需认证） |
| PUT | /api/user/password | 修改密码（需认证） |
| GET | /api/my-comments | 获取我的评论（需认证） |

### 文章
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/articles | 获取所有文章 |
| POST | /api/articles | 创建文章（需认证） |
| GET | /api/articles/detail/:id | 获取文章详情 |
| PUT | /api/articles/detail/:id | 更新文章（需认证） |
| DELETE | /api/articles/detail/:id | 删除文章（需认证） |

### 评论
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/comments | 发表评论（需认证） |
| GET | /api/articles/:article_id/comments | 获取文章评论 |
| DELETE | /api/comments/:id | 删除评论（需认证） |

### 标签
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tags | 获取所有标签 |
| POST | /api/tags | 创建标签（需管理员） |
| GET | /api/articles/:article_id/tags | 获取文章标签 |
| POST | /api/articles/:article_id/tags/:tag_id | 为文章添加标签（需管理员） |

### 留言板
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/messages | 发表留言（需认证） |
| DELETE | /api/messages/:id | 删除留言（需认证） |

## 版本历史

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细版本更新记录。

## 开发团队

- **Timeclimber** - 项目创建者

## 许可证

MIT License