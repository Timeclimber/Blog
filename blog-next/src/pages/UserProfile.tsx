import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { useToast } from "../components/Toast"
import UserAvatar from "../components/UserAvatar"
import { ArticleCardSkeleton } from "../components/Skeleton"

const UserProfile = () => {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<any>(null)
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadUserProfile = useCallback(async (userId: number) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    try {
      // 获取用户信息
      const userRes = await fetch(`/api/users/${userId}`, {
        signal: controller.signal,
      })
      const userData = await userRes.json()
      if (!controller.signal.aborted) {
        if (userData.success) {
          setUser(userData.data)
        } else {
          showToast(userData.message || "获取用户信息失败", "error")
        }
      }

      // 获取用户文章
      const articlesRes = await fetch(`/api/users/${userId}/articles`, {
        signal: controller.signal,
      })
      const articlesData = await articlesRes.json()
      if (!controller.signal.aborted) {
        if (articlesData.success) {
          setArticles(articlesData.data || [])
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      console.error(err)
      showToast("加载用户资料失败", "error")
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [showToast])

  useEffect(() => {
    if (id) {
      const userId = parseInt(id)
      if (!isNaN(userId)) {
        loadUserProfile(userId)
      }
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [id, loadUserProfile])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">用户不存在</h2>
        <p className="text-gray-600">该用户可能已被删除或不存在</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 用户信息卡片 */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-center gap-6">
          <UserAvatar user={user} size="xl" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user.username}</h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {user.role === "admin" ? "管理员" : "用户"}
              </span>
              <span className="text-sm text-gray-500">
                注册于 {formatDate(user.created_at)}
              </span>
              <span className="text-sm text-gray-500">
                {articles.length} 篇文章
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">发布的文章</h2>
        {articles.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-600">该用户还没有发布文章</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <Link
                  to={`/article/${article.id}`}
                  className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
                >
                  {article.title}
                </Link>
                <p className="text-gray-600 mt-2 line-clamp-2">
                  {article.content.length > 150
                    ? article.content.substring(0, 150) + "..."
                    : article.content}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>{formatDate(article.created_at)}</span>
                  {article.views > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {article.views}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
