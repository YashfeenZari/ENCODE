import jwt from 'jsonwebtoken'
import { query } from '../config/db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const decoded = verifyToken(token)
  if (!decoded?.userId) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  const [user] = await query('SELECT id, username, email FROM users WHERE id = ?', [decoded.userId])
  if (!user) {
    return res.status(401).json({ error: 'User not found' })
  }
  req.user = user
  next()
}
