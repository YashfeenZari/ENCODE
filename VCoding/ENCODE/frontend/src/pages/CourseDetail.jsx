import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourseByIdApi } from '../api/courses'
import { getCourseThumbnail, getCourseFallbackThumbnail } from '../utils/courseMeta'
import styles from './CourseDetail.module.css'

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getCourseByIdApi(id)
      .then((data) => {
        if (mounted) setCourse(data)
      })
      .catch(() => {
        if (mounted) setCourse(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading course...</p>
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
      <div className={styles.hero}>
        <div className={styles.thumb}>
          <img
            src={getCourseThumbnail(course)}
            alt={course.title}
            onError={(e) => {
              e.currentTarget.src = getCourseFallbackThumbnail(course)
            }}
          />
        </div>
        <div className={styles.meta}>
          <span className={styles.category}>{course.category}</span>
          <h1 className={styles.title}>{course.title}</h1>
          <p className={styles.instructor}>{course.instructor}</p>
          <p className={styles.desc}>{course.description}</p>
          <ul className={styles.stats}>
            <li>{course.totalLessons} lessons</li>
            <li>{course.totalDurationHrs} hrs total</li>
          </ul>
          <h3 className={styles.learnTitle}>What you’ll learn</h3>
          <ul className={styles.learnList}>
            {(course.whatYouLearn || []).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          {Array.isArray(course.sections) && course.sections.length > 0 && (
            <>
              <h3 className={styles.learnTitle}>Course lessons</h3>
              <div className={styles.sectionsWrap}>
                {course.sections.map((section) => (
                  <div key={section.id} className={styles.sectionCard}>
                    <p className={styles.sectionTitle}>{section.title}</p>
                    <ul className={styles.lessonList}>
                      {(section.lessons || []).map((lesson) => (
                        <li key={lesson.id}>{lesson.title}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
          <Link to={`/courses/${course.id}/learn`} className={styles.enroll}>Enroll & start</Link>
        </div>
      </div>
    </div>
  )
}
