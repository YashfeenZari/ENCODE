import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconBookmark, IconBookmarkFilled } from './Icons'
import { getCourseThumbnail, getCourseFallbackThumbnail } from '../utils/courseMeta'
import styles from './CourseCard.module.css'

const difficultyStyles = {
  Beginner: styles.badgeBeginner,
  Intermediate: styles.badgeIntermediate,
  Advanced: styles.badgeAdvanced,
}

function StarRating({ rating }) {
  const value = Math.min(5, Math.max(0, rating ?? 0))
  const full = Math.round(value)
  return (
    <span className={styles.rating} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`${styles.star} ${i <= full ? styles.starFilled : ''}`}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function CourseCard({ course, progressPercent = 0, isBookmarked = false, onToggleBookmark, onPreview }) {
  const difficulty = course.difficulty || 'Beginner'
  const badgeClass = difficultyStyles[difficulty] || styles.badgeBeginner
  const showProgress = progressPercent > 0
  const [imgSrc, setImgSrc] = useState(getCourseThumbnail(course))

  useEffect(() => {
    setImgSrc(getCourseThumbnail(course))
  }, [course])

  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        <img
          src={imgSrc}
          alt={course.title}
          onError={() => {
            if (!String(imgSrc).startsWith('data:image/svg+xml')) {
              const fallback = getCourseFallbackThumbnail(course)
              setImgSrc(fallback)
            }
          }}
        />
        {showProgress && (
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
          </div>
        )}
        <button
          type="button"
          className={styles.bookmarkBtn}
          onClick={(e) => { e.preventDefault(); onToggleBookmark?.(course.id) }}
          aria-label={isBookmarked ? 'Remove from saved' : 'Save course'}
          title={isBookmarked ? 'Saved' : 'Save for later'}
        >
          {isBookmarked ? <IconBookmarkFilled /> : <IconBookmark />}
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={`${styles.badge} ${badgeClass}`}>{difficulty}</span>
          <span className={styles.stats}>
            {course.totalDurationHrs}h · {course.totalLessons} lessons
          </span>
        </div>
        <h3 className={styles.title}>{course.title}</h3>
        <div className={styles.ratingRow}>
          <StarRating rating={course.rating} />
          <span className={styles.studentCount}>
            {course.studentCount != null
              ? `${course.studentCount >= 1000 ? `${(course.studentCount / 1000).toFixed(1)}k` : course.studentCount} students`
              : ''}
          </span>
        </div>
        <p className={styles.desc}>{course.shortDescription}</p>
        <p className={styles.instructor}>{course.instructor}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.previewBtn} onClick={() => onPreview?.(course)}>
            Preview
          </button>
          <Link to={`/courses/${course.id}`} className={styles.link}>View details</Link>
          <Link to={`/courses/${course.id}/learn`} className={styles.enroll}>
            Start Learning
          </Link>
        </div>
      </div>
    </article>
  )
}
