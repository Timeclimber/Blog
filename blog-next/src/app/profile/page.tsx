'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { User, UpdateUserRequest, UpdatePasswordRequest } from '@/types'

type TabType = 'info' | 'edit' | 'password'

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<UpdateUserRequest>({})
  const [passwordForm, setPasswordForm] = useState<UpdatePasswordRequest>({
    oldPassword: '',
    newPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const router = useRouter()
  const { user, token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchUserInfo()
  }, [isAuthenticated, token, router])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserInfo(data)
        setEditForm({
          username: data.username,
          email: data.email
        })
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        setMessage('个人信息更新成功！')
        setMessageType('success')
        fetchUserInfo()
      } else {
        const data = await response.json()
        setMessage(data.message || '更新失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('更新失败，请重试')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      })

      if (response.ok) {
        setMessage('密码修改成功！')
        setMessageType('success')
        setPasswordForm({ oldPassword: '', newPassword: '' })
      } else {
        const data = await response.json()
        setMessage(data.message || '密码修改失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('密码修改失败，请重试')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <h1 className="text-2xl font-bold mb-6">个人中心</h1>

            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 font-medium ${activeTab === 'info' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                个人信息
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 font-medium ${activeTab === 'edit' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                编辑资料
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-4 py-2 font-medium ${activeTab === 'password' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                修改密码
              </button>
            </div>

            {message && (
              <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
                {message}
              </div>
            )}

            {activeTab === 'info' && userInfo && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-500 text-sm">用户名</label>
                  <p className="text-lg font-medium">{userInfo.username}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">邮箱</label>
                  <p className="text-lg font-medium">{userInfo.email}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">用户ID</label>
                  <p className="text-lg font-medium">{userInfo.id}</p>
                </div>
              </div>
            )}

            {activeTab === 'edit' && (
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label className="form-label">用户名</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.username || ''}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">邮箱</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '保存中...' : '保存修改'}
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label className="form-label">旧密码</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">新密码</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '修改中...' : '修改密码'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
