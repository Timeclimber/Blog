import { useState, useEffect } from "react"

interface User {
  id?: number
  username?: string
  avatar_url?: string
}

interface UserAvatarProps {
  user?: User | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const UserAvatar = ({ user, size = "md", className = "" }: UserAvatarProps) => {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [user?.id, user?.username, user?.avatar_url])
  
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-lg",
    xl: "w-12 h-12 text-xl",
  }

  const getInitial = (username?: string) => {
    if (!username || username.trim() === "") {
      return "?"
    }
    return username.charAt(0).toUpperCase()
  }

  const getRandomColor = (username?: string) => {
    const colors = [
      "bg-gradient-to-br from-pink-500 to-rose-500",
      "bg-gradient-to-br from-blue-500 to-indigo-500",
      "bg-gradient-to-br from-green-500 to-emerald-500",
      "bg-gradient-to-br from-yellow-500 to-orange-500",
      "bg-gradient-to-br from-purple-500 to-violet-500",
      "bg-gradient-to-br from-cyan-500 to-teal-500",
    ]
    if (!username || username.trim() === "") {
      return colors[0]
    }
    const index = username.charCodeAt(0) % colors.length
    return colors[index]
  }

  const hasValidAvatar = user?.avatar_url && user.avatar_url.trim() !== ""

  if (hasValidAvatar && !imgError) {
    return (
      <img
        key={user.avatar_url}
        src={user.avatar_url}
        alt={user.username || "用户"}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-600 ${className}`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold border-2 border-gray-600 ${getRandomColor(
        user?.username
      )} ${className}`}
    >
      {getInitial(user?.username)}
    </div>
  )
}

export default UserAvatar
