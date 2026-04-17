'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Article } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { user, isAuthenticated, token } = useAuth()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      const data = await response.json()
      setArticles(data || [])
    } catch (error) {
      console.error('获取文章失败:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!articleToDelete || !token) return

    try {
      const response = await fetch(`/api/articles/detail/${articleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setSuccessMessage('文章删除成功！')
        setShowSuccessModal(true)
        fetchArticles()
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除文章失败:', error)
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">文章列表</h1>
        </div>

        {articles.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-500">暂无文章</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      <Link 
                        href={`/article/${article.id}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    <div className="text-sm text-gray-500 mb-3">
                      <span>作者: {article.authorName}</span>
                      <span className="mx-2">|</span>
                      <span>发布于: {formatDate(article.createdAt)}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">
                      {article.content}
                    </p>
                  </div>
                  {isAuthenticated && user?.id === article.authorId && (
                    <button
                      onClick={() => handleDeleteClick(article)}
                      className="btn btn-danger ml-4"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showDeleteModal && articleToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除文章 "{articleToDelete.title}" 吗？此操作不可恢复。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn btn-danger"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">成功</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="btn btn-primary"
              >
                确定
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
