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
  const [isFollowing, setIsFollowing] = useState(false)
  const [followingAction, setFollowingAction] = useState(false)
  const [activeTab, setActiveTab] = useState<"articles" | "followers" | "following">("articles")
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const { showToast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadUserProfile = useCallback(async (userId: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    try {
      const userRes = await fetch(`/api/users/${userId}`, {
        signal: controller.signal,
      })
      const userData = await userRes.json()
      if (!controller.signal.aborted) {
        if (userData.success) {
          setUser(userData.data)
          setIsFollowing(userData.data.is_following || false)
        } else {
          showToast(userData.message || "获取用户信息失败", "error")
        }
      }

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

  const loadFollowers = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}/followers`)
      const data = await res.json()
      if (data.success) {
        setFollowers(data.data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const loadFollowingList = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}/following`)
      const data = await res.json()
      if (data.success) {
        setFollowing(data.data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setCurrentUserId(parsed?.id || null)
      } catch {
        // ignore
      }
    }

    if (id) {
      const userId = parseInt(id)
      if (!isNaN(userId)) {
        loadUserProfile(userId)
        loadFollowers(userId)
        loadFollowingList(userId)
      }
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [id, loadUserProfile, loadFollowers, loadFollowingList])

  const handleFollow = async () => {
    if (!id) return
    const token = localStorage.getItem("token")
    if (!token) {
      showToast("请先登录", "error")
      return
    }

    setFollowingAction(true)
    try {
      const method = isFollowing ? "DELETE" : "POST"
      const res = await fetch(`/api/users/${id}/follow`, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const result = await res.json()
      if (result.success) {
        setIsFollowing(!isFollowing)
        setUser((prev: any) => ({
          ...prev,
          follower_count: result.data.follower_count,
          following_count: result.data.following_count,
        }))
        showToast(isFollowing ? "取消关注成功" : "关注成功", "success")
        loadFollowers(parseInt(id))
      } else {
        showToast(result.message || "操作失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("操作失败", "error")
    } finally {
      setFollowingAction(false)
    }
  }

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

  const isOwnProfile = currentUserId === user?.id

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
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
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">用户不存在</h2>
        <p className="text-gray-600 dark:text-gray-400">该用户可能已被删除或不存在</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 用户信息卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <UserAvatar user={user} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.username}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                }`}>
                  {user.role === "admin" ? "管理员" : "用户"}
                </span>
              </div>
            </div>
          </div>
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              disabled={followingAction}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 ${
                isFollowing
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {followingAction ? "处理中..." : isFollowing ? "已关注" : "关注"}
            </button>
          )}
        </div>

        {/* 统计数据 */}
        <div className="flex items-center gap-8 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{articles.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">文章</div>
          </div>
          <button
            onClick={() => setActiveTab("followers")}
            className="text-center hover:text-blue-600 transition-colors"
          >
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.follower_count || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">粉丝</div>
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className="text-center hover:text-blue-600 transition-colors"
          >
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.following_count || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">关注</div>
          </button>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">注册于 {formatDate(user.created_at)}</div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "articles"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          文章
        </button>
        <button
          onClick={() => setActiveTab("followers")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "followers"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          粉丝
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "following"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          关注
        </button>
      </div>

      {/* 文章列表 */}
      {activeTab === "articles" && (
        <div>
          {articles.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-600 dark:text-gray-400">该用户还没有发布文章</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <Link
                    to={`/article/${article.id}`}
                    className="text-xl font-bold text-gray-800 dark:text-gray-100 hover:text-blue-600 transition-colors duration-200"
                  >
                    {article.title}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {article.content.length > 150
                      ? article.content.substring(0, 150) + "..."
                      : article.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
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
      )}

      {/* 粉丝列表 */}
      {activeTab === "followers" && (
        <div>
          {followers.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-600 dark:text-gray-400">暂无粉丝</p>
            </div>
          ) : (
            <div className="space-y-4">
              {followers.map((follower) => (
                <Link
                  key={follower.id}
                  to={`/user/${follower.id}`}
                  className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
                >
                  <UserAvatar user={follower} size="lg" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">{follower.username}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{follower.email}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 关注列表 */}
      {activeTab === "following" && (
        <div>
          {following.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-600 dark:text-gray-400">暂无关注</p>
            </div>
          ) : (
            <div className="space-y-4">
              {following.map((followedUser) => (
                <Link
                  key={followedUser.id}
                  to={`/user/${followedUser.id}`}
                  className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
                >
                  <UserAvatar user={followedUser} size="lg" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">{followedUser.username}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{followedUser.email}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserProfile
