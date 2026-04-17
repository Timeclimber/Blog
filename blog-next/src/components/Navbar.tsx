import { Link, useNavigate } from "react-router-dom"

const Navbar = () => {
  const navigate = useNavigate()
  const user = localStorage.getItem("user")
  const token = localStorage.getItem("token")

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">博客系统</Link>
        <div className="flex space-x-4">
          {token ? (
            <>
              <Link to="/new" className="hover:underline">写文章</Link>
              <Link to="/profile" className="hover:underline">个人中心</Link>
              <button onClick={handleLogout} className="hover:underline">退出</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">登录</Link>
              <Link to="/register" className="hover:underline">注册</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar