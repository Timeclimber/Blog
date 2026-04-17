import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

const Article = () => {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetch(`/api/articles/detail/${id}`)
        .then(res => res.json())
        .then(data => {
          setArticle(data.data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [id])

  if (loading) return <div>加载中...</div>
  if (!article) return <div>文章不存在</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-600 mb-4">{article.content}</p>
      <p className="text-sm text-gray-500">{article.created_at}</p>
    </div>
  )
}

export default Article