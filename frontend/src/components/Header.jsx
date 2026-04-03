import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Header.module.css'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-12 0c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
            </svg>
          </span>
          <span className={styles.logoText}><span className={styles.logoEn}>EN</span><span className={styles.logoCode}>CODE</span></span>
        </Link>
        <nav className={styles.nav}>
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/academy" className={styles.navLink}>Encode Academy</Link>
              <Link to="/about" className={styles.navLink}>About</Link>
              <button type="button" onClick={handleLogout} className={styles.btnLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.linkLogin}>Login</Link>
              <Link to="/signup" className={styles.btnRegister}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
