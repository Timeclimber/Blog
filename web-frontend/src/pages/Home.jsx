import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../Home.css'

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

function Home({ currentUser }) {
  const [articles, setArticles] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmData, setConfirmData] = useState({ title: '', message: '', callback: null })
  const [showToast, setShowToast] = useState(false)
  const [toastData, setToastData] = useState({ title: '', message: '', callback: null })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = () => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setArticles(data)
        }
      })
  }

  const showConfirmDialog = (title, message, callback) => {
    setConfirmData({ title, message, callback })
    setShowConfirm(true)
  }

  const hideConfirmDialog = () => {
    setShowConfirm(false)
    setConfirmData({ title: '', message: '', callback: null })
  }

  const handleConfirmOk = () => {
    if (confirmData.callback) {
      confirmData.callback()
    }
    hideConfirmDialog()
  }

  const showToastDialog = (title, message, callback) => {
    setToastData({ title, message, callback })
    setShowToast(true)
  }

  const hideToastDialog = () => {
    setShowToast(false)
    if (toastData.callback) {
      toastData.callback()
    }
    setToastData({ title: '', message: '', callback: null })
  }

  const deleteArticle = (articleId) => {
    showConfirmDialog('删除文章', '确定要删除这篇文章吗？删除后无法恢复！', () => {
      const token = localStorage.getItem('token')
      if (!token) {
        showToastDialog('提示', '请先登录！')
        return
      }

      fetch(`/api/articles/detail/${articleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showToastDialog('错误', data.error)
        } else {
          showToastDialog('删除成功', '文章删除成功！', () => {
            fetchArticles()
          })
        }
      })
      .catch(err => {
        showToastDialog('错误', '删除失败：' + err.message)
      })
    })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN')
  }

  return (
    <div className="home-container">
      <h2 className="page-title">文章列表</h2>
      
      {articles.length === 0 ? (
        <div className="empty-state">
          <p>暂无文章，快来发布第一篇吧！</p>
        </div>
      ) : (
        <div className="article-list">
          {articles.map(article => (
            <article key={article.id} className="article-card card">
              <div className="article-header">
                <div className="article-author">
                  <img 
                    src={article.User?.avatar_url || DEFAULT_AVATAR} 
                    alt="头像" 
                    className="author-avatar"
                    onError={(e) => { e.target.src = DEFAULT_AVATAR }}
                  />
                  <span className="author-name">{article.User?.username || '匿名'}</span>
                </div>
                <div className="article-meta">
                  <span className="article-date">{formatDate(article.created_at)}</span>
                  {currentUser && (currentUser.id === article.user_id || currentUser.role === 'admin') && (
                    <button 
                      className="btn btn-danger delete-btn"
                      onClick={() => deleteArticle(article.id)}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
              <h3 className="article-title">
                <Link to={`/article?id=${article.id}`} className="article-link">
                  {article.title}
                </Link>
              </h3>
              <p className="article-content">{article.content.substring(0, 200)}{article.content.length > 200 ? '...' : ''}</p>
            </article>
          ))}
        </div>
      )}

      {/* 确认弹窗 */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={hideConfirmDialog}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            <h3 className="confirm-title">{confirmData.title}</h3>
            <p className="confirm-message">{confirmData.message}</p>
            <div className="confirm-buttons">
              <button className="confirm-btn confirm-btn-cancel" onClick={hideConfirmDialog}>取消</button>
              <button className="confirm-btn confirm-btn-confirm" onClick={handleConfirmOk}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* 成功提示弹窗 */}
      {showToast && (
        <div className="toast-overlay" onClick={hideToastDialog}>
          <div className="toast-modal" onClick={(e) => e.stopPropagation()}>
            <div className="toast-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 className="toast-title">{toastData.title}</h3>
            <p className="toast-message">{toastData.message}</p>
            <button className="toast-btn" onClick={hideToastDialog}>确定</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
