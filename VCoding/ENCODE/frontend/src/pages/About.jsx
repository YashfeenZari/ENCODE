import styles from './About.module.css'

export default function About() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>About ENCODE</h1>
      <p className={styles.text}>
        ENCODE is a learning platform that brings together structured coding courses and
        Quran reflection. Learn the code of life—both on screen and in meaning.
      </p>
    </div>
  )
}
