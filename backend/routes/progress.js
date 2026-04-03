import { Router } from 'express'
import { query } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id
    const [enrollment] = await query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    )
    if (!enrollment) {
      return res.json({ enrolled: false, progress: {}, completedLessons: [] })
    }
    const progressRows = await query(
      'SELECT lesson_id, status, progress_percent FROM lesson_progress WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    )
    const progress = {}
    const completedLessons = []
    progressRows.forEach((r) => {
      progress[String(r.lesson_id)] = { status: r.status, progressPercent: r.progress_percent }
      if (r.status === 'completed') completedLessons.push(String(r.lesson_id))
    })
    const [lessonIds] = await query(
      `SELECT l.id FROM lessons l
       INNER JOIN sections s ON s.id = l.section_id
       WHERE s.course_id = ?`,
      [courseId]
    )
    const total = lessonIds.length
    const completed = completedLessons.length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    res.json({
      enrolled: true,
      progress,
      completedLessons,
      courseProgressPercent: percent,
      completedCount: completed,
      totalLessons: total,
    })
  } catch (e) {
    next(e)
  }
})

router.post('/:courseId/lessons/:lessonId', async (req, res, next) => {
  try {
    const { courseId, lessonId: lessonIdParam } = req.params
    const lessonId = String(lessonIdParam).replace(/^l/, '')
    const { status, progressPercent } = req.body
    const userId = req.user.id
    const validStatus = ['not_started', 'in_progress', 'completed'].includes(status) ? status : 'in_progress'
    const percent = Math.min(100, Math.max(0, Number(progressPercent) ?? 0))
    await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, course_id, status, progress_percent, last_watched_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE status = VALUES(status), progress_percent = VALUES(progress_percent), last_watched_at = CURRENT_TIMESTAMP`,
      [userId, lessonId, courseId, validStatus, percent]
    )
    const [lessonIds] = await query(
      `SELECT l.id FROM lessons l INNER JOIN sections s ON s.id = l.section_id WHERE s.course_id = ?`,
      [courseId]
    )
    const total = lessonIds.length
    if (validStatus === 'completed') {
      await query(
        'INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)',
        [userId, courseId]
      )
    }
    const [completedRows] = await query(
      'SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND status = ?',
      [userId, courseId, 'completed']
    )
    const completed = completedRows.length
    const courseProgressPercent = total > 0 ? Math.round((completed / total) * 100) : 0
    res.json({
      ok: true,
      courseProgressPercent,
      completedCount: completed,
      totalLessons: total,
    })
  } catch (e) {
    next(e)
  }
})

router.post('/:courseId/enroll', async (req, res, next) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id
    await query('INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)', [userId, courseId])
    res.status(201).json({ ok: true, enrolled: true })
  } catch (e) {
    next(e)
  }
})

export default router
