import { useState, useEffect } from "react"

const Home = () => {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/articles")
      .then(res => res.json())
      .then(data => {
        setArticles(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">文章列表</h1>
      {articles.map(article => (
        <div key={article.id} className="border p-4 mb-4">
          <h2 className="text-xl font-bold">{article.title}</h2>
          <p className="text-gray-600">{article.content}</p>
          <p className="text-sm text-gray-500">{article.created_at}</p>
        </div>
      ))}
    </div>
  )
}

export default Home