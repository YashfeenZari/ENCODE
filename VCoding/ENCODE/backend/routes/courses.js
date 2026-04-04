import { Router } from 'express'
import { query } from '../config/db.js'
import { getFallbackCourseById, getFallbackCourses } from '../data/fallbackCourses.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT id, title, description, short_description, thumbnail, instructor, category, category_slug,
             difficulty, total_duration_hrs, rating, student_count, what_you_learn,
             (
               SELECT l.youtube_url
               FROM sections s
               INNER JOIN lessons l ON l.section_id = s.id
               WHERE s.course_id = courses.id
               ORDER BY s.order_no ASC, l.order_number ASC
               LIMIT 1
             ) AS preview_youtube_url,
             (SELECT COUNT(*) FROM lessons l
              INNER JOIN sections s ON s.id = l.section_id
              WHERE s.course_id = courses.id) AS total_lessons
      FROM courses
      ORDER BY id
    `)
    const courses = rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      description: r.description,
      shortDescription: r.short_description,
      thumbnail: r.thumbnail,
      instructor: r.instructor,
      category: r.category,
      categorySlug: r.category_slug,
      difficulty: r.difficulty,
      totalDurationHrs: Number(r.total_duration_hrs) || 0,
      totalLessons: r.total_lessons ?? 0,
      rating: r.rating != null ? Number(r.rating) : null,
      studentCount: r.student_count ?? 0,
      previewYoutubeUrl: r.preview_youtube_url ?? null,
      whatYouLearn: r.what_you_learn ? (Array.isArray(r.what_you_learn) ? r.what_you_learn : JSON.parse(r.what_you_learn)) : null,
    }))
    res.json(courses)
  } catch (e) {
    try {
      res.json(getFallbackCourses())
    } catch (fallbackErr) {
      next(fallbackErr)
    }
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const [course] = await query(
      `SELECT id, title, description, short_description, thumbnail, instructor, category, category_slug,
              difficulty, total_duration_hrs, rating, student_count, what_you_learn
       FROM courses WHERE id = ?`,
      [req.params.id]
    )
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    const sections = await query(
      `SELECT id, title, order_no FROM sections WHERE course_id = ? ORDER BY order_no`,
      [req.params.id]
    )
    const sectionsWithLessons = await Promise.all(
      sections.map(async (sec) => {
        const lessons = await query(
          `SELECT id, title, order_number, youtube_url, duration_minutes
           FROM lessons WHERE section_id = ? ORDER BY order_number`,
          [sec.id]
        )
        return {
          id: `s${sec.id}`,
          title: sec.title,
          orderNo: sec.order_no,
          lessons: lessons.map((l) => ({
            id: `l${l.id}`,
            title: l.title,
            orderNumber: l.order_number,
            youtubeUrl: l.youtube_url,
            durationMinutes: l.duration_minutes,
          })),
        }
      })
    )
    const totalLessons = sectionsWithLessons.reduce((sum, s) => sum + s.lessons.length, 0)
    res.json({
      id: String(course.id),
      title: course.title,
      description: course.description,
      shortDescription: course.short_description,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      category: course.category,
      categorySlug: course.category_slug,
      difficulty: course.difficulty,
      totalDurationHrs: Number(course.total_duration_hrs) || 0,
      totalLessons,
      rating: course.rating != null ? Number(course.rating) : null,
      studentCount: course.student_count ?? 0,
      whatYouLearn: course.what_you_learn
        ? Array.isArray(course.what_you_learn)
          ? course.what_you_learn
          : JSON.parse(course.what_you_learn)
        : null,
      sections: sectionsWithLessons,
    })
  } catch (e) {
    try {
      const fallbackCourse = getFallbackCourseById(req.params.id)
      if (!fallbackCourse) return res.status(404).json({ error: 'Course not found' })
      res.json(fallbackCourse)
    } catch (fallbackErr) {
      next(fallbackErr)
    }
  }
})

export default router
