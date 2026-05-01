import { useState, useEffect, useCallback, useRef } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../components/Toast"
import { ArticleCardSkeleton } from "../components/Skeleton"

interface Tag {
  id: number
  name: string
  created_at: string
  article_count: number
}

interface TagWithColor extends Tag {
  color: string
  size: string
}

const Tags = () => {
  const [tags, setTags] = useState<TagWithColor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<number | null>(null)
  const [tagArticles, setTagArticles] = useState<any[]>([])
  const [articlesLoading, setArticlesLoading] = useState(false)
  const { showToast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadTags = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tags")
      const data = await res.json()
      if (data.success) {
        const colors = [
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50",
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50",
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50",
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50",
          "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50",
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50",
          "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50",
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50",
          "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900/50",
        ]
        const tagsWithColors = (data.data || []).map((tag: Tag, index: number) => ({
          ...tag,
          color: colors[index % colors.length],
          size: tag.article_count > 5 ? "text-lg font-bold" : tag.article_count > 2 ? "text-base font-medium" : "text-sm",
        }))
        setTags(tagsWithColors)
      }
    } catch (err) {
      console.error(err)
      showToast("加载标签失败", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const loadTagArticles = useCallback(async (tagId: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setArticlesLoading(true)
    try {
      const res = await fetch(`/api/articles`, { signal: controller.signal })
      const data = await res.json()
      if (!controller.signal.aborted && data.success) {
        const filtered = (data.data || []).filter((article: any) =>
          article.tags?.some((t: any) => t.id === tagId)
        )
        setTagArticles(filtered)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name !== "AbortError") {
        console.error(err)
      }
    } finally {
      if (!controller.signal.aborted) {
        setArticlesLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  const handleTagClick = (tag: TagWithColor) => {
    setSelectedTag(tag.id)
    loadTagArticles(tag.id)
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">标签云</h1>

      {/* 标签云 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
        {loading ? (
          <div className="flex flex-wrap gap-3 justify-center">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏷️</div>
            <p className="text-gray-600 dark:text-gray-400">暂无标签</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag)}
                className={`${tag.color} ${tag.size} px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 ${
                  selectedTag === tag.id ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 选中标签的文章 */}
      {selectedTag && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            标签下的文章
          </h2>
          {articlesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          ) : tagArticles.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-600 dark:text-gray-400">该标签下暂无文章</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tagArticles.map((article) => (
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
    </div>
  )
}

export default Tags