import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

function Article({ currentUser }) {
  const [searchParams] = useSearchParams()
  const articleId = searchParams.get('id')

  return (
    <div className="container">
      <h2>文章详情</h2>
      <p>文章ID: {articleId}</p>
      <p>此页面正在开发中...</p>
    </div>
  )
}

export default Article
