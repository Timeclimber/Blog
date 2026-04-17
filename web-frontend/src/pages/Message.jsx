import { useState, useEffect } from 'react'

function Message({ currentUser }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = () => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setMessages(data)
        }
      })
  }

  return (
    <div className="container">
      <h2 className="page-title">留言板</h2>
      <p>此页面正在开发中...</p>
      <p>留言数量: {messages.length}</p>
    </div>
  )
}

export default Message
