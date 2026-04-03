import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCourseByIdApi, getCoursesApi } from '../api/courses'
import { inferCourseTrack } from '../utils/courseMeta'
import CourseCard from '../components/CourseCard'
import CoursePreviewModal from '../components/CoursePreviewModal'
import AnimatedHeroBackground from '../components/AnimatedHeroBackground'
import StreakWidget from '../components/StreakWidget'
import { useLearning } from '../context/LearningContext'
import {
  IconUsers,
  IconPlaylist,
  IconGrid,
  IconStar,
  IconRocket,
  IconCode,
  IconLayers,
  IconInfinity,
} from '../components/Icons'
import styles from './Academy.module.css'

const CATEGORIES = [
  { slug: 'all', label: 'All Courses' },
  { slug: 'web-development', label: 'Web Development' },
  { slug: 'python', label: 'Python' },
  { slug: 'ai-ml', label: 'AI / Machine Learning' },
  { slug: 'data-structures', label: 'Data Structures' },
  { slug: 'backend', label: 'Backend Development' },
  { slug: 'quran', label: 'Quran Studies' },
]

const STATS = [
  { value: '10,000+', label: 'Students', Icon: IconUsers },
  { value: '120+', label: 'Lessons', Icon: IconPlaylist },
  { value: '15+', label: 'Courses', Icon: IconGrid },
  { value: '4.9', label: 'Rating', Icon: IconStar },
]

const LEARNING_PATHS = [
  { step: 1, title: 'Beginner Path', desc: 'Start from scratch with fundamentals and small projects.' },
  { step: 2, title: 'Intermediate Path', desc: 'Build real apps and deepen your understanding.' },
  { step: 3, title: 'Advanced Path', desc: 'Specialize and ship production-ready projects.' },
]

const FEATURES = [
  { Icon: IconRocket, title: 'Project Based Learning', desc: 'Learn by building real projects from day one.' },
  { Icon: IconCode, title: 'Real World Coding Skills', desc: 'Industry-relevant skills that translate to the job.' },
  { Icon: IconLayers, title: 'Structured Curriculum', desc: 'Clear paths from beginner to advanced.' },
  { Icon: IconInfinity, title: 'Lifetime Access', desc: 'One-time access to courses and future updates.' },
]

export default function Academy() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [previewCourse, setPreviewCourse] = useState(null)
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  const { getContinueLearning, getRecommended, getProgress, toggleBookmark, isBookmarked } = useLearning()

  const handlePreview = async (course) => {
    try {
      const full = await getCourseByIdApi(course.id)
      setPreviewCourse(full)
    } catch {
      setPreviewCourse(course)
    }
  }

  useEffect(() => {
    let mounted = true
    getCoursesApi()
      .then((data) => {
        if (mounted) setCourses(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        if (mounted) setError(e.message || 'Failed to load courses')
      })
    return () => {
      mounted = false
    }
  }, [])

  const filteredCourses = useMemo(() => {
    if (activeCategory === 'all') return courses
    return courses.filter((c) => inferCourseTrack(c) === activeCategory)
  }, [activeCategory, courses])

  const continueLearning = useMemo(() => getContinueLearning(courses), [getContinueLearning, courses])
  const recommended = useMemo(() => getRecommended(courses), [getRecommended, courses])

  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.heroWrapper}>
        <AnimatedHeroBackground />
        <div className={styles.hero}>
          <p className={styles.heroLabel}>ENCODE ACADEMY</p>
          <h1 className={styles.heroTitle}>Master Coding with Structured Learning Paths</h1>
          <p className={styles.heroSub}>
            Interactive courses in Web Development, Python, AI, and Computer Science designed for beginners to advanced developers.
          </p>
          <div className={styles.heroCta}>
            <Link to="#courses" className={styles.ctaPrimary}>Start Learning</Link>
            <Link to="#courses" className={styles.ctaSecondary}>Browse Courses</Link>
          </div>
        </div>
      </header>

      {/* Streak + Stats */}
      <section className={styles.statsSection}>
        <div className={styles.streakWrap}>
          <StreakWidget />
        </div>
        <div className={styles.statsGrid}>
          {STATS.map(({ value, label, Icon }) => (
            <div key={label} className={styles.statCard}>
              <div className={styles.statIcon}>
                <Icon />
              </div>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Continue Learning */}
      {continueLearning.length > 0 && (
        <section className={styles.continueSection}>
          <p className={styles.sectionLabel}>Continue Learning</p>
          <h2 className={styles.sectionTitle}>Pick up where you left off</h2>
          <div className={styles.cardGrid}>
            {continueLearning.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progressPercent={course.progressPercent}
                isBookmarked={isBookmarked(course.id)}
                onToggleBookmark={toggleBookmark}
                onPreview={handlePreview}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <section className={styles.recommendedSection}>
          <p className={styles.sectionLabel}>Recommended for you</p>
          <h2 className={styles.sectionTitle}>Based on your interests</h2>
          <div className={styles.cardGrid}>
            {recommended.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progressPercent={getProgress(course.id)}
                isBookmarked={isBookmarked(course.id)}
                onToggleBookmark={toggleBookmark}
                onPreview={handlePreview}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category tabs + Course grid */}
      <section className={styles.coursesSection} id="courses">
        {error && <p className={styles.sectionLabel}>{error}</p>}
        <div className={styles.tabsWrap}>
          {CATEGORIES.map(({ slug, label }) => (
            <button
              key={slug}
              type="button"
              className={`${styles.tab} ${activeCategory === slug ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(slug)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.cardGrid}>
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progressPercent={getProgress(course.id)}
              isBookmarked={isBookmarked(course.id)}
              onToggleBookmark={toggleBookmark}
              onPreview={handlePreview}
            />
          ))}
        </div>
      </section>

      {/* Learning path */}
      <section className={styles.pathSection}>
        <p className={styles.sectionLabel}>Learning Path</p>
        <h2 className={styles.sectionTitle}>Your journey from zero to ship</h2>
        <div className={styles.pathSteps}>
          {LEARNING_PATHS.map((item, i) => (
            <div key={item.step} className={styles.pathStep}>
              {i > 0 && <div className={styles.pathConnector} aria-hidden />}
              <div className={styles.pathCard}>
                <span className={styles.pathNumber}>{item.step}</span>
                <h3 className={styles.pathCardTitle}>{item.title}</h3>
                <p className={styles.pathCardDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <p className={styles.sectionLabel}>Why learn here</p>
        <h2 className={styles.sectionTitle}>Built for developers who ship</h2>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <Icon />
              </div>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {previewCourse && (
        <CoursePreviewModal course={previewCourse} onClose={() => setPreviewCourse(null)} />
      )}
    </div>
  )
}
