import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "../components/Toast"
import { useConfirm } from "../components/ConfirmDialog"

const Article = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [commentContent, setCommentContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()

  useEffect(() => {
    loadArticle()
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [id])

  const loadArticle = async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/articles/detail/${id}`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        showToast(result.message || "加载失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("加载失败", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteArticle = async () => {
    if (!data?.article) return

    const confirmed = await showConfirm({
      title: "删除文章",
      message: `确定要删除文章《${data.article.title}》吗？此操作不可恢复！`,
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
      const res = await fetch(`/api/articles/detail/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const result = await res.json()
      if (result.success) {
        showToast("文章删除成功！", "success")
        navigate("/")
      } else {
        showToast(result.message || "删除失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("删除失败", "error")
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    if (!token) {
      showToast("请先登录", "error")
      navigate("/login")
      return
    }

    if (!commentContent.trim()) {
      showToast("请输入评论内容", "error")
      return
    }

    setSubmittingComment(true)
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          article_id: parseInt(id!),
          content: commentContent,
        }),
      })
      const result = await res.json()
      if (result.success) {
        showToast("评论发表成功！", "success")
        setCommentContent("")
        loadArticle()
      } else {
        showToast(result.message || "发表失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("发表失败", "error")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    const confirmed = await showConfirm({
      title: "删除评论",
      message: "确定要删除这条评论吗？",
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
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const result = await res.json()
      if (result.success) {
        showToast("评论删除成功！", "success")
        loadArticle()
      } else {
        showToast(result.message || "删除失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("删除失败", "error")
    }
  }

  const canDeleteArticle = () => {
    if (!user || !data?.article) return false
    return user.id === data.article.user_id || user.role === "admin"
  }

  const canDeleteComment = (comment: any) => {
    if (!user) return false
    return user.id === comment.user_id || user.role === "admin"
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data?.article) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">文章不存在</h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回首页
        </button>
      </div>
    )
  }

  const { article, comments = [] } = data

  return (
    <div className="max-w-3xl mx-auto">
      <article className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {article.user && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {article.user.avatar_url ? (
                      <img
                        src={article.user.avatar_url}
                        alt={article.user.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-sm">👤</span>
                    )}
                  </div>
                  <span>{article.user.username}</span>
                </div>
              )}
              <span>•</span>
              <span>{formatDate(article.created_at)}</span>
            </div>
          </div>
          {canDeleteArticle() && (
            <button
              onClick={handleDeleteArticle}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="删除文章"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
          {article.content}
        </div>
      </article>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">评论 ({comments.length})</h2>

        {user && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  发表评论
                </label>
                <textarea
                  id="comment"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
                  placeholder="写下你的评论..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? "发表中..." : "发表评论"}
              </button>
            </form>
          </div>
        )}

        {comments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">暂无评论</h3>
            <p className="text-gray-600">
              {user ? "快来发表第一条评论吧！" : "登录后可以发表评论"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <div
                key={comment.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {comment.user?.avatar_url ? (
                        <img
                          src={comment.user.avatar_url}
                          alt={comment.user.username}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-lg">👤</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {comment.user?.username || "匿名用户"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </div>
                    </div>
                  </div>
                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="删除评论"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="mt-4 text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Article
