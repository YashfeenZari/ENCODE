import styles from './AnimatedHeroBackground.module.css'

export default function AnimatedHeroBackground() {
  return (
    <div className={styles.canvas} aria-hidden>
      {/* Gradient mesh – slow movement */}
      <div className={styles.mesh} />
      {/* Soft floating blobs */}
      <div className={styles.blob} data-blob="1" />
      <div className={styles.blob} data-blob="2" />
      <div className={styles.blob} data-blob="3" />
      <div className={styles.blob} data-blob="4" />
      {/* Glowing particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className={styles.particle} style={{ '--i': i }} />
      ))}
    </div>
  )
}
