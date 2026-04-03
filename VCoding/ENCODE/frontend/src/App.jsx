import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Academy from './pages/Academy'
import CourseDetail from './pages/CourseDetail'
import CourseLearn from './pages/CourseLearn'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="academy" element={<Protected><Academy /></Protected>} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="courses/:id/learn" element={<Protected><CourseLearn /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
