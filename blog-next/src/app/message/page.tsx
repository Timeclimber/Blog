'use client'

import React, { useState, useEffect } from 'react'
import { Message, CreateMessageRequest } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export default function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated, token } = useAuth()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data || [])
      }
    } catch (error) {
      console.error('获取留言失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    setError('')

    if (!isAuthenticated || !token) {
      setError('请先登录')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        setContent('')
        fetchMessages()
      } else {
        const data = await response.json()
        setError(data.message || '留言失败')
      }
    } catch (error) {
      setError('留言失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!token || !confirm('确定要删除这条留言吗？')) return

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchMessages()
      } else {
        alert('删除失败')
      }
    } catch (error) {
      alert('删除失败，请重试')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="card mb-8">
            <h1 className="text-2xl font-bold mb-6">留言板</h1>

            {error && (
              <div className="alert alert-error mb-4">
                {error}
              </div>
            )}

            {isAuthenticated ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="写下你的留言..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? '发表中...' : '发表留言'}
                </button>
              </form>
            ) : (
              <p className="text-gray-500">请先登录后发表留言</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">全部留言 ({messages.length})</h2>

            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">暂无留言</p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800">{message.username}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{formatDate(message.createdAt)}</span>
                        {isAuthenticated && (
                          <button
                            onClick={() => handleDelete(message.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
