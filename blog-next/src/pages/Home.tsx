import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../components/Toast"
import { useConfirm } from "../components/ConfirmDialog"
import UserAvatar from "../components/UserAvatar"
import { ArticleCardSkeleton } from "../components/Skeleton"

const Home = () => {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()

  useEffect(() => {
    loadArticles()
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const loadArticles = async () => {
    try {
      const res = await fetch("/api/articles")
      const data = await res.json()
      if (data.success) {
        setArticles(data.data || [])
      }
    } catch (err) {
      console.error(err)
      showToast("加载文章失败", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteArticle = async (articleId: number, articleTitle: string) => {
    const confirmed = await showConfirm({
      title: "删除文章",
      message: `确定要删除文章《${articleTitle}》吗？此操作不可恢复！`,
      confirmText: "确认删除",
      cancelText: "取消",
      type: "danger",
    })

    if (!confirmed) return

    const token = localStorage.getItem("token")
    if (!token) {
      showToast("请先登录", "error")
      return
    }

    try {
      const res = await fetch(`/api/articles/detail/${articleId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        showToast("文章删除成功！", "success")
        loadArticles()
      } else {
        showToast(data.message || "删除失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("删除失败", "error")
    }
  }

  const canDeleteArticle = (article: any) => {
    if (!user) return false
    return user.id === article.user_id || user.role === "admin"
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">文章列表</h1>
          {user && (
            <Link
              to="/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
            >
              写文章
            </Link>
          )}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">文章列表</h1>
        {user && (
          <Link
            to="/new"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            写文章
          </Link>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">暂无文章</h2>
          <p className="text-gray-600 mb-6">快来发布第一篇文章吧！</p>
          {user && (
            <Link
              to="/new"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
            >
              写文章
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    to={`/article/${article.id}`}
                    className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
                  >
                    {article.title}
                  </Link>
                  <p className="text-gray-600 mt-2 line-clamp-3">
                    {article.content.length > 200
                      ? article.content.substring(0, 200) + "..."
                      : article.content}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    {article.user && (
                      <div className="flex items-center gap-2">
                        <UserAvatar user={article.user} size="sm" />
                        <span>{article.user.username}</span>
                      </div>
                    )}
                    <span>•</span>
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                </div>
                {canDeleteArticle(article) && (
                  <button
                    onClick={() => handleDeleteArticle(article.id, article.title)}
                    className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="删除文章"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home