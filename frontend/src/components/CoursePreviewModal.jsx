import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCourseThumbnail, getCourseFallbackThumbnail } from '../utils/courseMeta'
import styles from './CoursePreviewModal.module.css'

const difficultyStyles = {
  Beginner: styles.badgeBeginner,
  Intermediate: styles.badgeIntermediate,
  Advanced: styles.badgeAdvanced,
}

function StarRating({ rating }) {
  const value = Math.min(5, Math.max(0, rating ?? 0))
  const full = Math.floor(value)
  return (
    <span className={styles.rating} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`${styles.star} ${i <= full ? styles.starFilled : ''}`}>
          ★
        </span>
      ))}
      <span className={styles.ratingValue}>{value}</span>
    </span>
  )
}

export default function CoursePreviewModal({ course, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!course) return null

  const difficulty = course.difficulty || 'Beginner'
  const badgeClass = difficultyStyles[difficulty] || styles.badgeBeginner
  const previewLessons = (course.sections || [])
    .flatMap((section) => (section.lessons || []).map((lesson) => `${section.title} - ${lesson.title}`))
    .slice(0, 12)

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className={styles.thumb}>
          <img
            src={getCourseThumbnail(course)}
            alt={course.title}
            onError={(e) => {
              e.currentTarget.src = getCourseFallbackThumbnail(course)
            }}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.meta}>
            <span className={`${styles.badge} ${badgeClass}`}>{difficulty}</span>
            <span className={styles.stats}>
              {course.totalDurationHrs}h · {course.totalLessons} lessons
            </span>
          </div>
          <h2 id="preview-title" className={styles.title}>{course.title}</h2>
          <div className={styles.ratingRow}>
            <StarRating rating={course.rating} />
            {course.studentCount != null && (
              <span className={styles.studentCount}>
                {course.studentCount >= 1000 ? `${(course.studentCount / 1000).toFixed(1)}k` : course.studentCount} students
              </span>
            )}
          </div>
          <p className={styles.desc}>{course.description || course.shortDescription}</p>
          {course.whatYouLearn?.length > 0 && (
            <div className={styles.learnList}>
              <strong>What you&apos;ll learn</strong>
              <ul>
                {course.whatYouLearn.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {previewLessons.length > 0 && (
            <div className={styles.learnList}>
              <strong>Lessons in this course</strong>
              <ul>
                {previewLessons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <p className={styles.instructor}>Instructor: {course.instructor}</p>
          <div className={styles.actions}>
            <Link to={`/courses/${course.id}/learn`} className={styles.enrollBtn} onClick={onClose}>
              Enroll now
            </Link>
            <Link to={`/courses/${course.id}`} className={styles.detailLink} onClick={onClose}>
              View full details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
