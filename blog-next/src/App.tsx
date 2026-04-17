import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NewArticle from "./pages/NewArticle"
import Article from "./pages/Article"
import Profile from "./pages/Profile"
import Message from "./pages/Message"

function App() {
  return (
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
          <Route path="/message" element={<Message />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App