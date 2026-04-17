'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
            我的博客
          </Link>
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className={`hover:text-indigo-200 transition-colors ${isActive('/') ? 'text-indigo-200' : ''}`}
            >
              首页
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  href="/new" 
                  className={`hover:text-indigo-200 transition-colors ${isActive('/new') ? 'text-indigo-200' : ''}`}
                >
                  写文章
                </Link>
                <Link 
                  href="/message" 
                  className={`hover:text-indigo-200 transition-colors ${isActive('/message') ? 'text-indigo-200' : ''}`}
                >
                  留言板
                </Link>
                <Link 
                  href="/profile" 
                  className={`hover:text-indigo-200 transition-colors ${isActive('/profile') ? 'text-indigo-200' : ''}`}
                >
                  {user?.username}
                </Link>
                <button 
                  onClick={logout}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={`hover:text-indigo-200 transition-colors ${isActive('/login') ? 'text-indigo-200' : ''}`}
                >
                  登录
                </Link>
                <Link 
                  href="/register" 
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
