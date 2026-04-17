'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CreateArticleRequest } from '@/types'

export default function NewArticle() {
  const [formData, setFormData] = useState<CreateArticleRequest>({
    title: '',
    content: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { token, isAuthenticated } = useAuth()

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.message || '发布失败')
      }
    } catch (err) {
      setError('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <h1 className="text-2xl font-bold mb-6">写文章</h1>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">标题</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="请输入文章标题"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">内容</label>
                <textarea
                  name="content"
                  className="form-textarea"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="请输入文章内容"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push('/')}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '发布中...' : '发布'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
