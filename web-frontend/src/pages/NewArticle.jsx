import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function NewArticle({ currentUser }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    if (!title || !content) {
      setError('标题和内容不能为空')
      return
    }

    fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ title, content })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setError(data.error)
      } else {
        navigate('/')
      }
    })
    .catch(err => {
      setError('发布失败：' + err.message)
    })
  }

  return (
    <div className="container">
      <h2 className="page-title">写文章</h2>
      
      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="error-message show">{error}</div>
        )}
        
        <div className="form-group">
          <label htmlFor="title">标题</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="10"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tags">标签（用逗号分隔）</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        
        <button type="submit" className="btn btn-primary">发布文章</button>
      </form>
    </div>
  )
}

export default NewArticle
