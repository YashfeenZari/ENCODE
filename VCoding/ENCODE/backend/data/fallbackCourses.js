import path from 'path'
import { fileURLToPath } from 'url'
import xlsx from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workbookPath = path.join(__dirname, 'courses.xlsx')

let cache = null

function normalizeKey(input = '') {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function pick(row, candidates) {
  for (const key of Object.keys(row)) {
    if (candidates.includes(normalizeKey(key))) return row[key]
  }
  return undefined
}

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function buildFallbackData() {
  const wb = xlsx.readFile(workbookPath)
  const lessonsSheetName = wb.SheetNames[0]
  const lessonRows = xlsx.utils.sheet_to_json(wb.Sheets[lessonsSheetName], { defval: '' })

  const courseMap = new Map()
  let nextCourseId = 1
  let nextSectionId = 1
  let nextLessonId = 1

  for (const row of lessonRows) {
    const courseTitle = String(pick(row, ['course']) || '').trim()
    const sectionTitle = String(pick(row, ['section']) || '').trim()
    const lessonTitle = String(pick(row, ['lesson_title', 'lesson']) || '').trim()
    if (!courseTitle || !lessonTitle) continue

    const courseKey = courseTitle.toLowerCase()
    let course = courseMap.get(courseKey)
    if (!course) {
      course = {
        id: String(nextCourseId++),
        title: courseTitle,
        description: '',
        shortDescription: '',
        thumbnail: '',
        instructor: 'ENCODE Team',
        category: 'General',
        categorySlug: 'general',
        difficulty: 'Beginner',
        totalDurationHrs: 0,
        rating: 4.5,
        studentCount: 0,
        whatYouLearn: null,
        previewYoutubeUrl: null,
        sections: [],
      }
      courseMap.set(courseKey, course)
    }

    const sectionName = sectionTitle || 'General'
    let section = course.sections.find((s) => s.title === sectionName)
    if (!section) {
      section = { id: `s${nextSectionId++}`, title: sectionName, orderNo: course.sections.length + 1, lessons: [] }
      course.sections.push(section)
    }

    const youtubeUrl = String(pick(row, ['youtube_url_embedded', 'youtube_url', 'youtube']) || '').trim()
    const lesson = {
      id: `l${nextLessonId++}`,
      title: lessonTitle,
      orderNumber: toNumber(pick(row, ['order', 'order_number']), section.lessons.length + 1),
      youtubeUrl: youtubeUrl || null,
      durationMinutes: null,
    }
    section.lessons.push(lesson)
    if (!course.previewYoutubeUrl && lesson.youtubeUrl) course.previewYoutubeUrl = lesson.youtubeUrl
  }

  const byId = new Map()
  const all = Array.from(courseMap.values()).map((course) => {
    const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0)
    const normalized = { ...course, totalLessons }
    byId.set(normalized.id, normalized)
    return normalized
  })
  return { all, byId }
}

export function getFallbackCourses() {
  if (!cache) cache = buildFallbackData()
  return cache.all.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    shortDescription: course.shortDescription,
    thumbnail: course.thumbnail,
    instructor: course.instructor,
    category: course.category,
    categorySlug: course.categorySlug,
    difficulty: course.difficulty,
    totalDurationHrs: course.totalDurationHrs,
    totalLessons: course.totalLessons,
    rating: course.rating,
    studentCount: course.studentCount,
    previewYoutubeUrl: course.previewYoutubeUrl,
    whatYouLearn: course.whatYouLearn,
  }))
}

export function getFallbackCourseById(id) {
  if (!cache) cache = buildFallbackData()
  const course = cache.byId.get(String(id))
  if (!course) return null
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    shortDescription: course.shortDescription,
    thumbnail: course.thumbnail,
    instructor: course.instructor,
    category: course.category,
    categorySlug: course.categorySlug,
    difficulty: course.difficulty,
    totalDurationHrs: course.totalDurationHrs,
    totalLessons: course.totalLessons,
    rating: course.rating,
    studentCount: course.studentCount,
    whatYouLearn: course.whatYouLearn,
    sections: course.sections,
  }
}
