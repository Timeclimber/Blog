import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import Article from './pages/Article'
import NewArticle from './pages/NewArticle'
import Message from './pages/Message'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/user', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setCurrentUser(data)
        }
      })
      .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    window.location.href = '/'
  }

  if (isLoading) {
    return <div className="loading">加载中...</div>
  }

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-container">
            <h1 className="logo">本地个人博客</h1>
            <nav className="nav">
              <Link to="/" className="nav-link">首页</Link>
              <Link to="/new" className="nav-link">写文章</Link>
              <Link to="/message" className="nav-link">留言板</Link>
              
              {!currentUser ? (
                <>
                  <Link to="/login" className="nav-link">登录</Link>
                  <Link to="/register" className="nav-link">注册</Link>
                </>
              ) : (
                <div className="user-info">
                  <img 
                    src={currentUser.avatar_url || DEFAULT_AVATAR} 
                    alt="头像" 
                    className="nav-avatar"
                  />
                  <span className="nav-username">{currentUser.username}</span>
                  <Link to="/profile" className="nav-link">个人中心</Link>
                  <a href="#" onClick={logout} className="nav-link">退出</a>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<Home currentUser={currentUser} />} />
            <Route path="/article" element={<Article currentUser={currentUser} />} />
            <Route path="/new" element={<NewArticle currentUser={currentUser} />} />
            <Route path="/message" element={<Message currentUser={currentUser} />} />
            <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 本地个人博客</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
