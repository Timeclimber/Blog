import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NewArticle from "./pages/NewArticle"
import Article from "./pages/Article"
import Profile from "./pages/Profile"
import UserProfile from "./pages/UserProfile"
import Message from "./pages/Message"
import Tags from "./pages/Tags"
import { ToastProvider } from "./components/Toast"
import { ConfirmDialogProvider } from "./components/ConfirmDialog"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import CursorEffect from "./components/CursorEffect"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmDialogProvider>
            <CursorEffect />
            <Router>
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/new" element={<NewArticle />} />
                  <Route path="/article/:id" element={<Article />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/user/:id" element={<UserProfile />} />
                  <Route path="/message" element={<Message />} />
                  <Route path="/tags" element={<Tags />} />
                </Routes>
              </div>
            </Router>
          </ConfirmDialogProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App