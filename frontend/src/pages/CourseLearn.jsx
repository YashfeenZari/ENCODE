import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourseByIdApi } from '../api/courses'
import { useLearning } from '../context/LearningContext'
import styles from './CourseLearn.module.css'

function getEmbedUrl(url) {
  if (!url) return ''
  const match = url.match(/(?:v=|\/embed\/)([a-zA-Z0-9_-]{11})/)
  const id = match ? match[1] : null
  return id ? `https://www.youtube.com/embed/${id}` : url
}

function withStartSeconds(url, seconds) {
  if (!url) return ''
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  if (safeSeconds <= 0) return url
  const joiner = url.includes('?') ? '&' : '?'
  return `${url}${joiner}start=${safeSeconds}`
}

function formatSavedTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString()
}

function noteStorageKey(courseId, lessonId) {
  return `encode_note_${courseId}_${lessonId}`
}

function lessonResumeKey(courseId) {
  return `encode_last_lesson_${courseId}`
}

function lessonTimeKey(courseId, lessonId) {
  return `encode_last_time_${courseId}_${lessonId}`
}

export default function CourseLearn() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const { getProgress, setProgress, addLearningTime } = useLearning()

  const allLessons = useMemo(() => {
    const list = []
    sections.forEach((sec) =>
      sec.lessons.forEach((les) => list.push({ ...les, sectionTitle: sec.title }))
    )
    return list.sort((a, b) => a.orderNumber - b.orderNumber)
  }, [sections])

  const [currentLesson, setCurrentLesson] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [savedNoteMeta, setSavedNoteMeta] = useState(null)
  const [isEditingNote, setIsEditingNote] = useState(true)
  const [resumeStartSeconds, setResumeStartSeconds] = useState(0)
  const liveResumeSecondsRef = useRef(0)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getCourseByIdApi(id)
      .then((data) => {
        if (!mounted) return
        setCourse(data)
        setSections(Array.isArray(data?.sections) ? data.sections : [])
      })
      .catch(() => {
        if (!mounted) return
        setCourse(null)
        setSections([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    const storedLessonId = window.localStorage.getItem(lessonResumeKey(id))
    const resumed = storedLessonId ? allLessons.find((l) => l.id === storedLessonId) : null
    setCurrentLesson(resumed || allLessons[0] || null)
  }, [id, allLessons])

  useEffect(() => {
    if (currentLesson?.id) {
      window.localStorage.setItem(lessonResumeKey(id), currentLesson.id)
    }
  }, [id, currentLesson?.id])

  useEffect(() => {
    if (!currentLesson?.id) return
    const raw = window.localStorage.getItem(lessonTimeKey(id, currentLesson.id))
    const savedSeconds = raw ? Number(raw) : 0
    const safeSavedSeconds = Number.isFinite(savedSeconds) ? Math.max(0, Math.floor(savedSeconds)) : 0
    setResumeStartSeconds(safeSavedSeconds)
    liveResumeSecondsRef.current = safeSavedSeconds
  }, [id, currentLesson?.id])

  useEffect(() => {
    if (!currentLesson?.id) return
    const storageKey = lessonTimeKey(id, currentLesson.id)
    const tick = () => {
      if (document.visibilityState !== 'visible') return
      liveResumeSecondsRef.current += 5
      window.localStorage.setItem(storageKey, String(liveResumeSecondsRef.current))
    }
    const interval = setInterval(tick, 5000)
    return () => clearInterval(interval)
  }, [id, currentLesson?.id])

  useEffect(() => {
    if (!currentLesson?.id) return
    const key = noteStorageKey(id, currentLesson.id)
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) {
        setNotesDraft('')
        setSavedNoteMeta(null)
        setIsEditingNote(true)
        return
      }
      const parsed = JSON.parse(raw)
      setNotesDraft(parsed?.text || '')
      setSavedNoteMeta(parsed?.savedAt ? { savedAt: parsed.savedAt } : null)
      setIsEditingNote(false)
    } catch {
      setNotesDraft('')
      setSavedNoteMeta(null)
      setIsEditingNote(true)
    }
  }, [id, currentLesson?.id])

  const progressPercent = getProgress(id)
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const completedCount = Math.round((progressPercent / 100) * allLessons.length)

  const markComplete = () => {
    if (allLessons.length === 0) return
    if (progressPercent < 100) {
      const next = Math.min(100, progressPercent + 100 / allLessons.length)
      setProgress(id, next)
    }
  }

  const saveNote = () => {
    if (!currentLesson?.id) return
    const savedAt = new Date().toISOString()
    const payload = {
      text: notesDraft,
      savedAt,
      courseId: id,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
    }
    window.localStorage.setItem(noteStorageKey(id, currentLesson.id), JSON.stringify(payload))
    setSavedNoteMeta({ savedAt })
    setIsEditingNote(false)
  }

  useEffect(() => {
    const interval = setInterval(() => addLearningTime(30), 30000)
    return () => clearInterval(interval)
  }, [addLearningTime])

  const embedUrl = currentLesson ? withStartSeconds(getEmbedUrl(currentLesson.youtubeUrl), resumeStartSeconds) : ''

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading lessons...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className={styles.page}>
        <p>Course not found.</p>
        <Link to="/academy">Back to Academy</Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to={`/courses/${id}`} className={styles.back}>← Back to course</Link>
        <h1 className={styles.courseTitle}>{course.title}</h1>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Lessons</h3>
          {sections.map((sec) => (
            <div key={sec.id} className={styles.section}>
              <div className={styles.sectionTitle}>{sec.title}</div>
              {sec.lessons.map((les) => (
                <button
                  key={les.id}
                  type="button"
                  className={`${styles.lessonItem} ${currentLesson?.id === les.id ? styles.active : ''}`}
                  onClick={() => setCurrentLesson(les)}
                >
                  {les.title}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <div className={styles.content}>
          <div className={styles.videoWrap}>
            {embedUrl ? (
              <iframe
                title={currentLesson?.title}
                src={embedUrl}
                className={styles.video}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={styles.videoPlaceholder}>Select a lesson</div>
            )}
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <p className={styles.progressText}>
            {completedCount} / {allLessons.length} lessons completed · {Math.round(progressPercent)}%
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnSecondary}
              disabled={!prevLesson}
              onClick={() => prevLesson && setCurrentLesson(prevLesson)}
            >
              Previous
            </button>
            <button type="button" className={styles.btnPrimary} onClick={markComplete}>
              Mark complete
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              disabled={!nextLesson}
              onClick={() => nextLesson && setCurrentLesson(nextLesson)}
            >
              Next lesson
            </button>
          </div>

          {currentLesson && (
            <>
              <h3 className={styles.lessonTitle}>{currentLesson.title}</h3>
              <div className={styles.tools}>
                <div className={styles.toolBlock}>
                  <h4>Notes</h4>
                  <textarea
                    placeholder="Take notes here..."
                    value={notesDraft}
                    disabled={!isEditingNote}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className={styles.notesArea}
                    rows={4}
                  />
                  <div className={styles.noteActions}>
                    {isEditingNote ? (
                      <button type="button" className={styles.btnPrimary} onClick={saveNote}>
                        Save note
                      </button>
                    ) : (
                      <button type="button" className={styles.btnSecondary} onClick={() => setIsEditingNote(true)}>
                        Edit note
                      </button>
                    )}
                    {savedNoteMeta?.savedAt && (
                      <p className={styles.noteMeta}>Saved at: {formatSavedTime(savedNoteMeta.savedAt)}</p>
                    )}
                  </div>
                </div>
                <div className={styles.toolBlock}>
                  <h4>Interview questions</h4>
                  <p className={styles.placeholder}>Questions for this lesson will appear here.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
