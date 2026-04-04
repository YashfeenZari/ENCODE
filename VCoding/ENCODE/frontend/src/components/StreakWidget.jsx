import { useLearning } from '../context/LearningContext'
import styles from './StreakWidget.module.css'

const STREAK_MIN_SECONDS = 120

function getTodayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getEncouragementMessage(seconds, isCompleted) {
  if (isCompleted) return '✔ Streak secured for today!'
  if (seconds >= 60) return 'Halfway there!'
  if (seconds >= 30) return 'Just 90 seconds more to keep your streak!'
  return 'Study 2 minutes to protect your streak!'
}

export default function StreakWidget() {
  const { streak } = useLearning()
  const { currentStreak, todayLearningTime, lastActiveDate, streakMessage } = streak
  const isCompletedToday = lastActiveDate === getTodayLocal() || todayLearningTime >= STREAK_MIN_SECONDS
  const todayProgress = Math.min(100, (todayLearningTime / STREAK_MIN_SECONDS) * 100)
  const encouragement = getEncouragementMessage(todayLearningTime, isCompletedToday)

  return (
    <div className={styles.widget}>
      <div className={styles.streakRow}>
        <span className={styles.flame} aria-hidden>🔥</span>
        <span className={styles.streakCount}>{currentStreak}</span>
        <span className={styles.streakLabel}>Day Streak</span>
      </div>
      <div className={styles.todayRow}>
        <p className={styles.goalLabel}>Goal: 2 minutes</p>
        <div className={`${styles.todayBar} ${isCompletedToday ? styles.todayBarComplete : ''}`}>
          <div
            className={`${styles.todayFill} ${isCompletedToday ? styles.todayFillComplete : ''}`}
            style={{ width: `${isCompletedToday ? 100 : todayProgress}%` }}
          />
        </div>
        <p className={isCompletedToday ? styles.messageSuccess : styles.messagePrompt}>
          {encouragement}
        </p>
      </div>
      {streakMessage === 'grace' && (
        <p className={styles.messageGrace}>Grace day used. Don&apos;t miss again.</p>
      )}
      {streakMessage === 'broken' && (
        <p className={styles.messageBroken}>Your streak has ended. Start again today!</p>
      )}
    </div>
  )
}
