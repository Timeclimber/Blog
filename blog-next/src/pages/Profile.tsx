import { useState, useEffect } from "react"

const Profile = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    fetch("/api/user", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>加载中...</div>
  if (!user) return <div>请先登录</div>

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">个人中心</h1>
      <div className="border p-4">
        <p><strong>用户名：</strong>{user.username}</p>
        <p><strong>ID：</strong>{user.id}</p>
      </div>
    </div>
  )
}

export default Profile