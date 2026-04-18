import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: number
  username: string
  email: string
  role: string
  avatar_url?: string
  gender?: string
  created_at?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (userData: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setToken(storedToken)
  }, [])

  const login = (userData: User, newToken: string) => {
    setUser(userData)
    setToken(newToken)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", newToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
