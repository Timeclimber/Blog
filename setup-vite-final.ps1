Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
$env:Path = "c:\Users\zjw\.trae-cn\sdks\versions\node\current;" + $env:Path

# 清理旧目录
Remove-Item -Recurse -Force "blog-next" -ErrorAction SilentlyContinue

# 创建新目录
New-Item -ItemType Directory -Path "blog-next" -Force
cd "blog-next"

# 初始化项目
npm init -y

# 安装依赖
npm install react@^18.2.0 react-dom@^18.2.0 react-router-dom@^6.21.0
npm install --save-dev @types/react@^18.2.43 @types/react-dom@^18.2.17 @vitejs/plugin-react@^4.2.1 typescript@^5.2.2 vite@^5.0.8

# 创建配置文件
New-Item -ItemType File -Path "vite.config.ts" -Value 'import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
})'

New-Item -ItemType File -Path "tsconfig.json" -Value '{"compilerOptions":{"target":"ES2020","useDefineForClassFields":true,"lib":["ES2020","DOM","DOM.Iterable"],"module":"ESNext","skipLibCheck":true,"moduleResolution":"bundler","allowImportingTsExtensions":true,"resolveJsonModule":true,"isolatedModules":true,"noEmit":true,"jsx":"react-jsx","strict":true,"noUnusedLocals":true,"noUnusedParameters":true,"noFallthroughCasesInSwitch":true},"include":["src"],"references":[{"path":"./tsconfig.node.json"}]}'

New-Item -ItemType File -Path "tsconfig.node.json" -Value '{"compilerOptions":{"composite":true,"skipLibCheck":true,"module":"ESNext","moduleResolution":"bundler","allowSyntheticDefaultImports":true},"include":["vite.config.ts"]}'

New-Item -ItemType File -Path "index.html" -Value '<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>博客系统</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>'

# 创建 src 目录结构
New-Item -ItemType Directory -Path "src" -Force
New-Item -ItemType Directory -Path "src\components" -Force
New-Item -ItemType Directory -Path "src\pages" -Force

# 创建核心文件
New-Item -ItemType File -Path "src\main.tsx" -Value 'import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)'

New-Item -ItemType File -Path "src\App.tsx" -Value 'import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App'

New-Item -ItemType File -Path "src\index.css" -Value 'body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
}'

New-Item -ItemType File -Path "src\components\Navbar.tsx" -Value 'import { Link } from "react-router-dom"

const Navbar = () => {
  const token = localStorage.getItem("token")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.reload()
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">博客系统</Link>
        <div className="flex space-x-4">
          {token ? (
            <>
              <button onClick={handleLogout} className="hover:underline">退出</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">登录</Link>
              <Link to="/register" className="hover:underline">注册</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar'

New-Item -ItemType File -Path "src\pages\Home.tsx" -Value 'import { useState, useEffect } from "react"

const Home = () => {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/articles")
      .then(res => res.json())
      .then(data => {
        setArticles(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">文章列表</h1>
      {articles.map(article => (
        <div key={article.id} className="border p-4 mb-4">
          <h2 className="text-xl font-bold">{article.title}</h2>
          <p className="text-gray-600">{article.content}</p>
          <p className="text-sm text-gray-500">{article.created_at}</p>
        </div>
      ))}
    </div>
  )
}

export default Home'

New-Item -ItemType File -Path "src\pages\Login.tsx" -Value 'import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("token", data.data.token)
          localStorage.setItem("user", JSON.stringify(data.data.user))
          navigate("/")
        } else {
          setError(data.message)
        }
      })
      .catch(err => {
        console.error(err)
        setError("登录失败")
      })
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">登录</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">用户名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">密码</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2">登录</button>
      </form>
    </div>
  )
}

export default Login'

New-Item -ItemType File -Path "src\pages\Register.tsx" -Value 'import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Register = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          navigate("/login")
        } else {
          setError(data.message)
        }
      })
      .catch(err => {
        console.error(err)
        setError("注册失败")
      })
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">注册</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">用户名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">密码</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2">注册</button>
      </form>
    </div>
  )
}

export default Register'

# 更新 package.json 脚本
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$packageJson.scripts = @{
  "dev" = "vite"
  "build" = "tsc && vite build"
  "preview" = "vite preview"
}
$packageJson | ConvertTo-Json -Depth 32 | Set-Content "package.json"

# 安装依赖
npm install

# 启动开发服务器
npm run dev