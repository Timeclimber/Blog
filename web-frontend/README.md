# 博客前端 - React 版本

这是用 React + Vite 重构的博客前端，配合 Go 后端 API 使用。

## 技术栈

- **React 18** - UI 框架
- **Vite 5** - 构建工具（比 Webpack 更快）
- **React Router 6** - 路由管理
- **Fetch API** - 网络请求

## 项目结构

```
web-frontend/
├── src/
│   ├── pages/          # 页面组件
│   │   ├── Home.jsx        # 首页
│   │   ├── Article.jsx     # 文章详情页
│   │   ├── NewArticle.jsx  # 写文章页
│   │   ├── Message.jsx     # 留言板页
│   │   ├── Login.jsx       # 登录页
│   │   ├── Register.jsx    # 注册页
│   │   └── Profile.jsx     # 个人中心页
│   ├── App.jsx         # 主应用组件（含路由）
│   ├── main.jsx        # 应用入口
│   ├── App.css         # 全局样式
│   ├── Home.css        # 首页样式
│   └── index.css       # 基础样式
├── index.html          # HTML 模板
├── vite.config.js      # Vite 配置（含 API 代理）
└── package.json        # 依赖配置
```

## 快速开始

### 1. 安装依赖

```bash
cd web-frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:5173` 启动，API 请求会自动代理到 `http://localhost:8080`（Go 后端）

### 3. 构建生产版本

```bash
npm run build
```

构建产物会生成在 `dist` 目录

### 4. 预览生产构建

```bash
npm run preview
```

## 已完成功能

- ✅ 项目框架搭建（React + Vite + React Router）
- ✅ 导航栏（登录/用户信息展示）
- ✅ 首页（文章列表、删除文章功能）
- ✅ 写文章页面
- ✅ 登录/注册页面
- ✅ 个人中心页面
- ✅ 自定义确认弹窗
- ✅ 自定义成功提示弹窗

## 待开发功能

- 🚧 文章详情页
- 🚧 留言板页面（完整功能）
- 🚧 个人中心编辑资料功能
- 🚧 个人中心修改密码功能

## API 代理配置

在 `vite.config.js` 中配置了 API 代理：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

这样前端请求 `/api/*` 会自动转发到 Go 后端的 `http://localhost:8080/api/*`

## 注意事项

1. **确保 Go 后端正在运行**：在启动前端前，先启动 Go 后端（端口 8080）
2. **跨域问题**：通过 Vite 代理解决了跨域问题，无需修改后端 CORS 配置
3. **开发时同时运行**：
   - 终端 1：启动 Go 后端
   - 终端 2：启动 React 前端开发服务器

## 开发建议

1. 使用 React DevTools 浏览器扩展来调试组件
2. 查看浏览器控制台的网络请求，确认 API 调用是否正常
3. 如果需要修改 API 地址，编辑 `vite.config.js` 中的 proxy 配置
