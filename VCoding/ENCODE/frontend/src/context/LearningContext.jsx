import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'

const STORAGE_PROGRESS = 'encode_academy_progress'
const STORAGE_BOOKMARKS = 'encode_academy_bookmarks'
const STORAGE_STREAK = 'encode_academy_streak'
const STREAK_MIN_SECONDS = 120 // 2 minutes

function getTodayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getYesterdayLocal() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

function daysBetween(dateStrA, dateStrB) {
  const a = parseDate(dateStrA)
  const b = parseDate(dateStrB)
  if (!a || !b) return 0
  return Math.round((b - a) / (24 * 60 * 60 * 1000))
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_PROGRESS)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return { '1': 40, '2': 100 }
}

function loadBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKMARKS)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return []
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STORAGE_STREAK)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return {
    currentStreak: 0,
    lastActiveDate: null,
    graceUsed: false,
    todayLearningTime: 0,
    lastDateTracked: null,
  }
}

const LearningContext = createContext(null)

function applyNewDayLogic(prev) {
  const today = getTodayLocal()
  const yesterday = getYesterdayLocal()
  if (prev.lastDateTracked === today) return prev
  const next = { ...prev, lastDateTracked: today, todayLearningTime: 0 }
  const lastActive = prev.lastActiveDate
  if (!lastActive) return next
  if (lastActive >= yesterday) return next // completed yesterday or today, no miss
  const daysMissed = daysBetween(lastActive, yesterday)
  if (daysMissed >= 2) {
    next.currentStreak = 0
    next.graceUsed = false
    next.streakMessage = 'broken'
  } else if (daysMissed === 1) {
    next.graceUsed = true
    next.streakMessage = 'grace'
  }
  return next
}

function applyDayComplete(prev) {
  const today = getTodayLocal()
  const yesterday = getYesterdayLocal()
  if (prev.lastActiveDate === today) return prev
  const next = { ...prev, lastActiveDate: today, streakMessage: null }
  const lastActive = prev.lastActiveDate
  if (!lastActive) {
    next.currentStreak = 1
    return next
  }
  if (lastActive === yesterday) {
    next.currentStreak = prev.currentStreak + 1
    next.graceUsed = false
    return next
  }
  if (lastActive < yesterday && prev.graceUsed && daysBetween(lastActive, yesterday) === 1) {
    next.graceUsed = false
    return next
  }
  if (lastActive < yesterday && daysBetween(lastActive, yesterday) >= 2) {
    next.currentStreak = 1
    next.graceUsed = false
    return next
  }
  next.currentStreak = prev.currentStreak || 1
  next.graceUsed = false
  return next
}

export function LearningProvider({ children }) {
  const [progress, setProgressState] = useState(loadProgress)
  const [bookmarks, setBookmarksState] = useState(loadBookmarks)
  const [streak, setStreakState] = useState(loadStreak)

  useEffect(() => {
    setStreakState((prev) => applyNewDayLogic(prev))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    localStorage.setItem(STORAGE_STREAK, JSON.stringify(streak))
  }, [streak])

  const setProgress = useCallback((courseId, percent) => {
    setProgressState((prev) => ({ ...prev, [courseId]: Math.min(100, Math.max(0, percent)) }))
  }, [])

  const toggleBookmark = useCallback((courseId) => {
    setBookmarksState((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    )
  }, [])

  const isBookmarked = useCallback(
    (courseId) => bookmarks.includes(courseId),
    [bookmarks]
  )

  const getProgress = useCallback(
    (courseId) => progress[courseId] ?? 0,
    [progress]
  )

  const getContinueLearning = useCallback((courses = []) => {
    return courses
      .filter((c) => {
        const p = progress[c.id] ?? 0
        return p > 0 && p < 100
      })
      .map((course) => ({ ...course, progressPercent: progress[course.id] ?? 0 }))
      .sort((a, b) => (b.progressPercent ?? 0) - (a.progressPercent ?? 0))
  }, [progress])

  const getRecommended = useCallback((courses = []) => {
    const inProgressIds = new Set(Object.keys(progress).filter((id) => (progress[id] ?? 0) < 100 && (progress[id] ?? 0) > 0))
    return courses
      .filter((c) => !inProgressIds.has(c.id))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 4)
  }, [progress])

  const addLearningTime = useCallback((seconds) => {
    if (!seconds || seconds <= 0) return
    setStreakState((prev) => {
      const today = getTodayLocal()
      let next = prev.lastDateTracked === today ? { ...prev } : applyNewDayLogic(prev)
      next = { ...next, todayLearningTime: next.todayLearningTime + seconds }
      if (next.todayLearningTime >= STREAK_MIN_SECONDS && next.lastActiveDate !== today) {
        next = applyDayComplete(next)
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      progress,
      bookmarks,
      setProgress,
      toggleBookmark,
      isBookmarked,
      getProgress,
      getContinueLearning,
      getRecommended,
      streak,
      addLearningTime,
    }),
    [progress, bookmarks, setProgress, toggleBookmark, isBookmarked, getProgress, getContinueLearning, getRecommended, streak, addLearningTime]
  )

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}

export function useLearning() {
  const ctx = useContext(LearningContext)
  if (!ctx) throw new Error('useLearning must be used within LearningProvider')
  return ctx
}
