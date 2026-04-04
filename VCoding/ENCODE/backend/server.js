import express from 'express'
import cors from 'cors'
import './config/loadEnv.js'
import authRoutes from './routes/auth.js'
import coursesRoutes from './routes/courses.js'
import progressRoutes from './routes/progress.js'
import { getPool } from './config/db.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: true }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'ENCODE API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/courses', coursesRoutes)
app.use('/api/progress', progressRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  const msg =
    err.message ||
    err.code ||
    (typeof err === 'string' ? err : null) ||
    'Internal server error'
  res.status(err.status || 500).json({ error: msg })
})

app.listen(PORT, async () => {
  if (
    !process.env.DATABASE_URL &&
    process.env.DB_HOST &&
    (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === '')
  ) {
    console.warn(
      '[ENCODE] DB_PASSWORD is empty — set it in backend/.env (same as Aiven/Render), then restart the server.'
    )
  }
  try {
    await getPool().getConnection()
    console.log(`ENCODE API running on port ${PORT}`)
  } catch (e) {
    console.warn('DB connection not ready:', e.message)
    console.log(`ENCODE API running on port ${PORT} (no DB)`)
  }
})
