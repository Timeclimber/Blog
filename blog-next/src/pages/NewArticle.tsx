import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import MarkdownEditor from "../components/MarkdownEditor"
import { useToast } from "../components/Toast"
import { useAuth } from "../contexts/AuthContext"

const NewArticle = () => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { token } = useAuth()

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    if (!token) return ""

    const formData = new FormData()
    formData.append("image", file)

    try {
      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        showToast("图片上传成功", "success")
        return data.data.url
      } else {
        showToast(data.message || "图片上传失败", "error")
        return ""
      }
    } catch {
      showToast("图片上传失败", "error")
      return ""
    }
  }, [token, showToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      showToast("请输入标题", "error")
      return
    }

    if (!content.trim()) {
      showToast("请输入内容", "error")
      return
    }

    if (!token) {
      showToast("请先登录", "error")
      navigate("/login")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          user_id: 1,
        }),
      })

      const data = await res.json()
      if (data.success) {
        showToast("文章发布成功！", "success")
        navigate(`/article/${data.data.id}`)
      } else {
        showToast(data.message || "发布失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("发布失败", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">写文章</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            标题
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="输入文章标题..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            内容（支持 Markdown）
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
            placeholder="开始写作... 支持 Markdown 语法"
            minHeight="400px"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "发布中..." : "发布文章"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewArticle