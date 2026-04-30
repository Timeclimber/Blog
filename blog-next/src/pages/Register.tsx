import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useToast } from "../components/Toast"

const Register = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!username.trim()) {
      newErrors.username = "用户名不能为空"
    } else if (username.length < 3) {
      newErrors.username = "用户名至少需要3个字符"
    } else if (username.length > 50) {
      newErrors.username = "用户名最多50个字符"
    }

    if (!password) {
      newErrors.password = "密码不能为空"
    } else if (password.length < 6) {
      newErrors.password = "密码至少需要6个字符"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (data.success) {
        showToast("注册成功！请登录", "success")
        navigate("/login")
      } else {
        showToast(data.message || "注册失败", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("注册失败，请稍后重试", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">注册账号</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username) {
                  setErrors(prev => ({ ...prev, username: "" }))
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="请输入用户名（至少3个字符）"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: "" }))
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="请输入密码（至少6个字符）"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              确认密码 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: "" }))
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="请再次输入密码"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "注册中..." : "注册"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          已有账号？{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register