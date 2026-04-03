import { Router } from 'express'
import crypto from 'crypto'
import { query } from '../config/db.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false
  const check = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'))
}

router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Username, email and password required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    const password_hash = hashPassword(password)
    await query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), password_hash]
    )
    const [user] = await query('SELECT id, username, email FROM users WHERE email = ?', [email.trim().toLowerCase()])
    const token = signToken({ userId: user.id })
    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email }, token })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email or username already registered' })
    }
    next(e)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }
    const [user] = await query('SELECT id, username, email, password_hash FROM users WHERE email = ?', [
      email.trim().toLowerCase(),
    ])
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const match = verifyPassword(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const token = signToken({ userId: user.id })
    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token,
    })
  } catch (e) {
    next(e)
  }
})

export default router
