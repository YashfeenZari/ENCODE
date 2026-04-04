import { Link } from 'react-router-dom'
import { IconBook, IconChart, IconFocus } from '../components/Icons'
import AnimatedHeroBackground from '../components/AnimatedHeroBackground'
import styles from './Home.module.css'

const features = [
  {
    Icon: IconBook,
    accent: 'lavender',
    title: 'Structured Courses',
    description: 'Step-by-step learning paths designed to build real skills. Each course is broken into clear modules and lessons.',
  },
  {
    Icon: IconChart,
    accent: 'mint',
    title: 'Track Progress',
    description: 'Always know where you are. Resume exactly where you stopped, with completion percentage and lesson history.',
  },
  {
    Icon: IconFocus,
    accent: 'pink',
    title: 'Focused Learning',
    description: 'Unlock lessons progressively. Stay focused without being overwhelmed, with notes and resources at your pace.',
  },
]

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.heroWrapper}>
        <AnimatedHeroBackground />
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Welcome to <span className={styles.heroBrand}>ENCODE</span>
          </h1>
          <p className={styles.heroSub}>
            Learn the skills to build the world, and the wisdom to build yourself.
          </p>
          <div className={styles.cta}>
            <Link to="/academy" className={styles.ctaPrimary}>Start Learning →</Link>
            <Link to="/academy" className={styles.ctaSecondary}>Explore Courses</Link>
          </div>
        </section>
      </div>

      <section className={styles.whySection}>
        <div className={styles.why}>
          <p className={styles.whyLabel}>Why ENCODE</p>
          <h2 className={styles.whyTitle}>Everything you need to level up</h2>
          <p className={styles.whySub}>
            Built around how learners actually learn — structured, progressive, and focused.
          </p>
          <div className={styles.featureGrid}>
          {features.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles[f.accent]}`}>
                <f.Icon />
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.description}</p>
            </div>
          ))}
          </div>
        </div>
      </section>
    </div>
  )
}
