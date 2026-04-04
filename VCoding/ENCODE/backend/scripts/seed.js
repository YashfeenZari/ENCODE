/**
 * ENCODE LMS Seed Script
 * Reads an Excel file and inserts courses, sections, and lessons into MySQL.
 *
 * Supports Google Sheet export format (e.g. Encode url data):
 *   Column A: Main Section (optional category)
 *   Column B: Course (course title; course is auto-created if missing)
 *   Column C: Section (section title; section_order computed from first appearance)
 *   Column D: Lesson Title
 *   Column E: Order (lesson order)
 *   Column F: YouTube URL (Embedded)
 *
 * Also supports optional "Courses" sheet and generic column names:
 *   course_id or course_title, section_title, section_order, lesson_title, lesson_order, youtube_url, duration_minutes
 *
 * Usage: npm run seed
 * Env: SEED_FILE path to .xlsx or .xls (default: data/courses.xlsx relative to backend)
 */
import 'dotenv/config'
import xlsx from 'xlsx'
import { getPool, query } from '../config/db.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEED_FILE = process.env.SEED_FILE || path.join(__dirname, '..', 'data', 'courses.xlsx')

function normalizeKey(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

function rowToObject(row, headers) {
  const out = {}
  headers.forEach((h, i) => {
    const key = normalizeKey(h)
    if (key) out[key] = row[i] != null ? row[i] : ''
  })
  return out
}

function getSheetNames(workbook) {
  return workbook.SheetNames || []
}

async function insertCoursesFromSheet(workbook, courseTitleToId) {
  const sheet = workbook.Sheets['Courses'] || workbook.Sheets['courses']
  if (!sheet) return courseTitleToId
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  if (data.length < 2) return courseTitleToId
  const headers = data[0].map(normalizeKey)
  for (let i = 1; i < data.length; i++) {
    const row = {}
    data[i].forEach((val, j) => {
      if (headers[j]) row[headers[j]] = val
    })
    const title = row.title || row.course_title
    if (!title) continue
    const whatYouLearn = row.what_you_learn
      ? (typeof row.what_you_learn === 'string'
          ? row.what_you_learn.split(',').map((s) => s.trim()).filter(Boolean)
          : row.what_you_learn)
      : null
    await query(
      `INSERT INTO courses (title, description, short_description, thumbnail, instructor, category, category_slug, difficulty, total_duration_hrs, rating, student_count, what_you_learn)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        row.description || null,
        row.short_description || null,
        row.thumbnail || null,
        row.instructor || 'Encode Academy',
        row.category || null,
        row.category_slug || null,
        row.difficulty || 'Beginner',
        Number(row.total_duration_hrs) || 0,
        row.rating != null ? Number(row.rating) : null,
        row.student_count != null ? Number(row.student_count) : 0,
        whatYouLearn ? JSON.stringify(whatYouLearn) : null,
      ]
    )
    const [inserted] = await query('SELECT id FROM courses ORDER BY id DESC LIMIT 1')
    courseTitleToId[String(title).trim()] = inserted.id
  }
  return courseTitleToId
}

async function seedFromLessonsSheet(workbook, courseTitleToId) {
  const sheet =
    workbook.Sheets['Lessons'] ||
    workbook.Sheets['lessons'] ||
    workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) {
    console.warn('No Lessons sheet or first sheet found.')
    return
  }
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  if (data.length < 2) {
    console.warn('Lessons sheet has no data rows.')
    return
  }
  const rawHeaders = data[0]
  const headers = rawHeaders.map((h) => normalizeKey(h))
  const get = (row, ...keys) => {
    for (const k of keys) {
      const v = row[k]
      if (v !== undefined && v !== null && v !== '') return v
    }
    return null
  }

  const courseSectionMap = {}
  const courseSectionOrder = {}
  const courseIds = await query('SELECT id, title FROM courses')
  const idByTitle = {}
  courseIds.forEach((c) => {
    idByTitle[String(c.title).trim()] = c.id
  })
  Object.assign(idByTitle, courseTitleToId)

  const mainSectionToSlug = (mainSection) => {
    if (!mainSection || !String(mainSection).trim()) return null
    const s = String(mainSection).toLowerCase()
    if (s.includes('coding')) return 'web-development'
    if (s.includes('life') || s.includes('character') || s.includes('quran')) return 'quran'
    return s.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  for (let i = 1; i < data.length; i++) {
    const row = {}
    data[i].forEach((val, j) => {
      if (headers[j]) row[headers[j]] = val
    })
    const courseIdRaw = get(row, 'course_id', 'courseid')
    const courseTitle = get(row, 'course_title', 'course_title', 'coursetitle', 'course')
    if (!courseTitle || !String(courseTitle).trim()) continue
    const courseTitleTrimmed = String(courseTitle).trim()
    let courseId = courseIdRaw != null ? Number(courseIdRaw) : null
    if (!courseId) courseId = idByTitle[courseTitleTrimmed]
    if (!courseId) {
      const mainSection = get(row, 'main_section', 'mainsection')
      const category = mainSection && String(mainSection).trim() ? String(mainSection).trim() : null
      const categorySlug = mainSectionToSlug(mainSection)
      await query(
        `INSERT INTO courses (title, description, short_description, thumbnail, instructor, category, category_slug, difficulty, total_duration_hrs, rating, student_count, what_you_learn)
         VALUES (?, NULL, NULL, NULL, 'Encode Academy', ?, ?, 'Beginner', 0, NULL, 0, NULL)`,
        [courseTitleTrimmed, category, categorySlug]
      )
      const [inserted] = await query('SELECT id FROM courses ORDER BY id DESC LIMIT 1')
      courseId = inserted.id
      idByTitle[courseTitleTrimmed] = courseId
    }
    const sectionTitle = get(row, 'section_title', 'section_title', 'sectiontitle', 'section') || 'Section'
    if (!courseSectionOrder[courseId]) {
      courseSectionOrder[courseId] = {}
      courseSectionOrder[courseId].next = 1
    }
    if (courseSectionOrder[courseId][sectionTitle] == null) {
      courseSectionOrder[courseId][sectionTitle] = courseSectionOrder[courseId].next++
    }
    const sectionOrder = courseSectionOrder[courseId][sectionTitle]
    const lessonTitle = get(row, 'lesson_title', 'lesson_title', 'lessontitle')
    if (!lessonTitle || !String(lessonTitle).trim()) continue
    const lessonOrder = Number(get(row, 'lesson_order', 'lesson_order', 'lessonorder', 'order_number', 'order')) || 1
    let youtubeUrl = get(row, 'youtube_url', 'youtube_url', 'youtubeurl', 'youtube_link', 'youtube_url_embedded') || null
    if (youtubeUrl && typeof youtubeUrl === 'string' && youtubeUrl.includes('/embed/')) {
      const match = youtubeUrl.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
      if (match) youtubeUrl = `https://www.youtube.com/watch?v=${match[1]}`
    }
    const durationMinutes = row.duration_minutes != null ? Number(row.duration_minutes) : null

    const sectionKey = `${courseId}:${sectionTitle}:${sectionOrder}`
    if (!courseSectionMap[sectionKey]) {
      await query(
        'INSERT INTO sections (course_id, title, order_no) VALUES (?, ?, ?)',
        [courseId, sectionTitle, sectionOrder]
      )
      const [secRow] = await query('SELECT id FROM sections WHERE course_id = ? AND title = ? AND order_no = ?', [
        courseId,
        sectionTitle,
        sectionOrder,
      ])
      courseSectionMap[sectionKey] = secRow.id
    }
    const sectionId = courseSectionMap[sectionKey]
    await query(
      'INSERT INTO lessons (section_id, title, order_number, youtube_url, duration_minutes) VALUES (?, ?, ?, ?, ?)',
      [sectionId, String(lessonTitle).trim(), lessonOrder, youtubeUrl, durationMinutes]
    )
  }
}

async function run() {
  console.log('ENCODE seed script')
  console.log('SEED_FILE:', SEED_FILE)
  const fs = await import('fs')
  if (!fs.existsSync(SEED_FILE)) {
    console.error('File not found:', SEED_FILE)
    console.error('Export your Google Sheet as .xlsx (File → Download → Microsoft Excel) and place it in backend/data/ as courses.xlsx, or set SEED_FILE to its path.')
    process.exit(1)
  }
  const workbook = xlsx.readFile(SEED_FILE)
  const pool = getPool()
  await pool.getConnection()

  let courseTitleToId = {}
  if (workbook.Sheets['Courses'] || workbook.Sheets['courses']) {
    console.log('Inserting courses from Courses sheet...')
    courseTitleToId = await insertCoursesFromSheet(workbook, courseTitleToId)
    console.log('Courses inserted:', Object.keys(courseTitleToId).length)
  }

  console.log('Inserting lessons...')
  await seedFromLessonsSheet(workbook, courseTitleToId)
  console.log('Done.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
