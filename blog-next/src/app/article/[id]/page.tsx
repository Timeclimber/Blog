'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Article, Comment } from '@/types'

export default function ArticleDetail() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchArticle()
      fetchComments()
    }
  }, [params.id])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/detail/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data)
      }
    } catch (error) {
      console.error('获取文章失败:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data || [])
      }
    } catch (error) {
      console.error('获取评论失败:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    setSubmitting(true)
    setError('')

    const token = localStorage.getItem('token')
    if (!token) {
      setError('请先登录')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: commentContent,
          articleId: parseInt(params.id as string)
        })
      })

      if (response.ok) {
        setCommentContent('')
        fetchComments()
      } else {
        const data = await response.json()
        setError(data.message || '评论失败')
      }
    } catch (error) {
      setError('评论失败，请重试')
    } finally {
      setSubmitting(false)
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

  if (!article) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="card text-center">
            <p className="text-gray-500">文章不存在</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <article className="card mb-8">
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            <div className="text-sm text-gray-500 mb-6">
              <span>作者: {article.authorName}</span>
              <span className="mx-2">|</span>
              <span>发布于: {formatDate(article.createdAt)}</span>
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{article.content}</p>
            </div>
          </article>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">评论 ({comments.length})</h2>

            {error && (
              <div className="alert alert-error mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="写下你的评论..."
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? '发表中...' : '发表评论'}
              </button>
            </form>

            {comments.length === 0 ? (
              <p className="text-gray-500 text-center">暂无评论</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800">{comment.username}</span>
                      <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-600">{comment.content}</p>
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
