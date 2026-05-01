import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useToast } from "../components/Toast"
import { useConfirm } from "../components/ConfirmDialog"
import UserAvatar from "../components/UserAvatar"
import MarkdownRenderer from "../components/MarkdownRenderer"

const Article = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [commentContent, setCommentContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liking, setLiking] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadArticle = useCallback(async () => {
    if (!id) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    try {
      const res = await fetch(`/api/articles/detail/${id}`, {
        signal: controller.signal,
      })
      const result = await res.json()
      if (!controller.signal.aborted) {
        if (result.success) {
          setData(result.data)
        } else {
          showToast(result.message || "加载失败", "error")
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      console.error(err)
      showToast("加载失败", "error")
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [id, showToast])

  useEffect(() => {
    loadArticle()
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadArticle])

  const handleLike = async () => {
    if (!user) {
      showToast("请先登录", "error")
      navigate("/login")
      return
    }

    if (!data?.article) return

    setLiking(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        showToast("请先登录", "error")
        return
      }

      const method = data.is_liked ? "DELETE" : "POST"
      const res = await fetch(`/api/articles/${id}/like`, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const result = await res.json()
      if (result.success) {
        setData((prev: any) => ({
          ...prev,
          like_count: result.data.like_count,
          is_liked: result.data.is_liked,
        }))
        showToast(data.is_liked ? "取消点赞成功" : "点赞成功", "success")
      } else {
        showToast(result.message || "操作失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("操作失败", "error")
    } finally {
      setLiking(false)
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      showToast("请先登录", "error")
      navigate("/login")
      return
    }

    if (!data?.article) return

    setBookmarking(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        showToast("请先登录", "error")
        return
      }

      const method = data.is_bookmarked ? "DELETE" : "POST"
      const res = await fetch(`/api/articles/${id}/bookmark`, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const result = await res.json()
      if (result.success) {
        setData((prev: any) => ({
          ...prev,
          bookmark_count: result.data.bookmark_count,
          is_bookmarked: result.data.is_bookmarked,
        }))
        showToast(data.is_bookmarked ? "取消收藏成功" : "收藏成功", "success")
      } else {
        showToast(result.message || "操作失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("操作失败", "error")
    } finally {
      setBookmarking(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url)
        showToast("链接已复制到剪贴板", "success")
      } catch {
        showToast("复制失败", "error")
      }
    } else {
      const textarea = document.createElement("textarea")
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      showToast("链接已复制到剪贴板", "success")
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
    try {
      return new Date(dateStr).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
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
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">文章不存在</h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回首页
        </button>
      </div>
    )
  }

  const { article, comments = [], like_count = 0, is_liked = false, bookmark_count = 0, is_bookmarked = false } = data

  return (
    <div className="max-w-3xl mx-auto">
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {article.user && (
                <div className="flex items-center gap-2">
                  <UserAvatar user={article.user} size="md" />
                  <Link
                    to={`/user/${article.user_id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {article.user.username}
                  </Link>
                </div>
              )}
              <span>•</span>
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
          {canDeleteArticle() && (
            <button
              onClick={handleDeleteArticle}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
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

        <MarkdownRenderer content={article.content} />

        {/* 操作按钮区 */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 flex-wrap">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 ${
              is_liked
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <svg
              className={`w-5 h-5 transition-all duration-200 ${is_liked ? "scale-110" : ""}`}
              fill={is_liked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{liking ? "处理中..." : `${like_count}`}</span>
          </button>

          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 ${
              is_bookmarked
                ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <svg
              className={`w-5 h-5 transition-all duration-200 ${is_bookmarked ? "scale-110" : ""}`}
              fill={is_bookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span>{bookmarking ? "处理中..." : `${bookmark_count}`}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span>分享</span>
          </button>
        </div>
      </article>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">评论 ({comments.length})</h2>

        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  发表评论
                </label>
                <textarea
                  id="comment"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
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
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">暂无评论</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {user ? "快来发表第一条评论吧！" : "登录后可以发表评论"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <div
                key={comment.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={comment.user} size="lg" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {comment.user?.username || "匿名用户"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.created_at)}
                      </div>
                    </div>
                  </div>
                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
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
                <div className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
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