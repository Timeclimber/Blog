import { useState, useEffect } from "react"
import { useToast } from "../components/Toast"
import { useAuth } from "../contexts/AuthContext"
import UserAvatar from "../components/UserAvatar"

type Tab = "info" | "edit" | "password" | "bookmarks"

interface User {
  id: number
  username: string
  email: string
  gender: string
  avatar_url: string
  role: string
  created_at: string
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState<Tab>("info")
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [bookmarksLoading, setBookmarksLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    gender: "",
    avatar_url: "",
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()
  const { token: authToken, login } = useAuth()

  useEffect(() => {
    loadUser()
  }, [])

  const loadBookmarks = async () => {
    if (!user || !authToken) return
    setBookmarksLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}/bookmarks`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setBookmarks(data.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBookmarksLoading(false)
    }
  }

  const loadUser = async () => {
    if (!authToken) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/user", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
        setEditForm({
          username: data.data.username,
          email: data.data.email,
          gender: data.data.gender || "",
          avatar_url: data.data.avatar_url || "",
        })
      }
    } catch (err) {
      console.error(err)
      showToast("加载用户信息失败", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authToken) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (data.success) {
        showToast("用户信息更新成功", "success")
        const updatedUser = { ...data.data }
        setUser(updatedUser)
        login(updatedUser, authToken)
        setActiveTab("info")
      } else {
        showToast(data.message || "更新失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("更新失败", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authToken) return

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast("两次输入的密码不一致", "error")
      return
    }

    if (passwordForm.new_password.length < 6) {
      showToast("新密码至少需要6个字符", "error")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast("密码修改成功", "success")
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        })
        setActiveTab("info")
      } else {
        showToast(data.message || "修改失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("修改失败", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const getGenderText = (gender: string) => {
    const genderMap: Record<string, string> = {
      "male": "男",
      "female": "女",
      "other": "其他",
    }
    return genderMap[gender] || "未设置"
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">登录后才能查看个人中心</p>
          <div className="flex gap-4 justify-center">
            <a
              href="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              立即登录
            </a>
            <a
              href="/register"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              注册新账号
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">个人中心</h1>

      {/* 标签页导航 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "info"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          个人信息
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "edit"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          编辑资料
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "password"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          修改密码
        </button>
        <button
          onClick={() => {
            setActiveTab("bookmarks")
            loadBookmarks()
          }}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "bookmarks"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          我的收藏
        </button>
      </div>

      {/* 个人信息标签页 */}
      {activeTab === "info" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-6 mb-6">
            <UserAvatar key={`profile-avatar-${user.id}-${user.username}-${user.avatar_url || 'none'}`} user={user} size="xl" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {user.role === "admin" ? "管理员" : "普通用户"}
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">用户 ID</span>
              <span className="font-medium text-gray-800">{user.id}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">用户名</span>
              <span className="font-medium text-gray-800">{user.username}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">邮箱</span>
              <span className="font-medium text-gray-800">{user.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">性别</span>
              <span className="font-medium text-gray-800">{getGenderText(user.gender)}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">注册时间</span>
              <span className="font-medium text-gray-800">{formatDate(user.created_at)}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setActiveTab("edit")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              编辑资料
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              修改密码
            </button>
          </div>
        </div>
      )}

      {/* 编辑资料标签页 */}
      {activeTab === "edit" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">编辑个人资料</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入邮箱"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                头像 URL
              </label>
              <input
                type="url"
                value={editForm.avatar_url}
                onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入头像图片链接"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "保存中..." : "保存修改"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("info")
                  if (user) {
                    setEditForm({
                      username: user.username,
                      email: user.email,
                      gender: user.gender || "",
                      avatar_url: user.avatar_url || "",
                    })
                  }
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 修改密码标签页 */}
      {activeTab === "password" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">修改密码</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                当前密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入当前密码"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入新密码（至少6个字符）"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                确认新密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请再次输入新密码"
                minLength={6}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "修改中..." : "修改密码"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("info")
                  setPasswordForm({
                    current_password: "",
                    new_password: "",
                    confirm_password: "",
                  })
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 收藏标签页 */}
      {activeTab === "bookmarks" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">我的收藏</h2>
          {bookmarksLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">暂无收藏</h3>
              <p className="text-gray-600 dark:text-gray-400">浏览文章时可以将喜欢的文章收藏起来</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <a
                    href={`/article/${bookmark.id}`}
                    className="text-lg font-bold text-gray-800 dark:text-gray-100 hover:text-blue-600 transition-colors"
                  >
                    {bookmark.title}
                  </a>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {bookmark.content.length > 150
                      ? bookmark.content.substring(0, 150) + "..."
                      : bookmark.content}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{bookmark.user?.username}</span>
                    <span>•</span>
                    <span>{new Date(bookmark.created_at).toLocaleDateString("zh-CN")}</span>
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

export default Profile
