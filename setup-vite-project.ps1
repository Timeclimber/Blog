Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
$env:Path = "c:\Users\zjw\.trae-cn\sdks\versions\node\current;" + $env:Path

# 清理旧目录
Remove-Item -Recurse -Force "d:\src\go_src\项目\Blog\blog-next" -ErrorAction SilentlyContinue

# 创建新目录
New-Item -ItemType Directory -Path "d:\src\go_src\项目\Blog\blog-next" -Force
cd "d:\src\go_src\项目\Blog\blog-next"

# 创建 package.json
New-Item -ItemType File -Path "package.json" -Value '{"name":"blog-vite","version":"1.0.0","private":true,"scripts":{"dev":"vite","build":"tsc && vite build","preview":"vite preview"},"dependencies":{"react":"^18.2.0","react-dom":"^18.2.0","react-router-dom":"^6.21.0"},"devDependencies":{"@types/react":"^18.2.43","@types/react-dom":"^18.2.17","@vitejs/plugin-react":"^4.2.1","typescript":"^5.2.2","vite":"^5.0.8"}}'

# 创建 vite.config.ts
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

# 创建 tsconfig.json
New-Item -ItemType File -Path "tsconfig.json" -Value '{"compilerOptions":{"target":"ES2020","useDefineForClassFields":true,"lib":["ES2020","DOM","DOM.Iterable"],"module":"ESNext","skipLibCheck":true,"moduleResolution":"bundler","allowImportingTsExtensions":true,"resolveJsonModule":true,"isolatedModules":true,"noEmit":true,"jsx":"react-jsx","strict":true,"noUnusedLocals":true,"noUnusedParameters":true,"noFallthroughCasesInSwitch":true},"include":["src"],"references":[{"path":"./tsconfig.node.json"}]}'

# 创建 tsconfig.node.json
New-Item -ItemType File -Path "tsconfig.node.json" -Value '{"compilerOptions":{"composite":true,"skipLibCheck":true,"module":"ESNext","moduleResolution":"bundler","allowSyntheticDefaultImports":true},"include":["vite.config.ts"]}'

# 创建 index.html
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

# 创建 src 目录
New-Item -ItemType Directory -Path "src" -Force

# 创建 main.tsx
New-Item -ItemType File -Path "src\main.tsx" -Value 'import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)'

# 创建 App.tsx
New-Item -ItemType File -Path "src\App.tsx" -Value 'import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NewArticle from "./pages/NewArticle"
import Article from "./pages/Article"
import Profile from "./pages/Profile"
import Message from "./pages/Message"

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/new" element={<NewArticle />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/message" element={<Message />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App'

# 创建 index.css
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

# 创建 components 目录
New-Item -ItemType Directory -Path "src\components" -Force

# 创建 Navbar.tsx
New-Item -ItemType File -Path "src\components\Navbar.tsx" -Value 'import { Link, useNavigate } from "react-router-dom"

const Navbar = () => {
  const navigate = useNavigate()
  const user = localStorage.getItem("user")
  const token = localStorage.getItem("token")

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">博客系统</Link>
        <div className="flex space-x-4">
          {token ? (
            <>
              <Link to="/new" className="hover:underline">写文章</Link>
              <Link to="/profile" className="hover:underline">个人中心</Link>
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

# 创建 pages 目录
New-Item -ItemType Directory -Path "src\pages" -Force

# 创建 Home.tsx
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

# 创建 Login.tsx
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

# 创建 Register.tsx
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

# 创建 NewArticle.tsx
New-Item -ItemType File -Path "src\pages\NewArticle.tsx" -Value 'import { useState } from "react"
import { useNavigate } from "react-router-dom"

const NewArticle = () => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    fetch("/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          navigate("/")
        } else {
          setError(data.message)
        }
      })
      .catch(err => {
        console.error(err)
        setError("创建文章失败")
      })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">写文章</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">标题</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-1">内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full p-2 border"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">发布</button>
      </form>
    </div>
  )
}

export default NewArticle'

# 创建 Article.tsx
New-Item -ItemType File -Path "src\pages\Article.tsx" -Value 'import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

const Article = () => {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetch(`/api/articles/detail/${id}`)
        .then(res => res.json())
        .then(data => {
          setArticle(data.data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [id])

  if (loading) return <div>加载中...</div>
  if (!article) return <div>文章不存在</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-600 mb-4">{article.content}</p>
      <p className="text-sm text-gray-500">{article.created_at}</p>
    </div>
  )
}

export default Article'

# 创建 Profile.tsx
New-Item -ItemType File -Path "src\pages\Profile.tsx" -Value 'import { useState, useEffect } from "react"

const Profile = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    fetch("/api/user", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>加载中...</div>
  if (!user) return <div>请先登录</div>

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">个人中心</h1>
      <div className="border p-4">
        <p><strong>用户名：</strong>{user.username}</p>
        <p><strong>ID：</strong>{user.id}</p>
      </div>
    </div>
  )
}

export default Profile'

# 创建 Message.tsx
New-Item -ItemType File -Path "src\pages\Message.tsx" -Value 'const Message = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">留言板</h1>
      <p>留言板功能开发中...</p>
    </div>
  )
}

export default Message'

# 安装依赖
npm install

# 启动开发服务器
npm run dev