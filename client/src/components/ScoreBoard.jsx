import styles from './ScoreBoard.module.css'

export default function ScoreBoard({ wins, losses, draws, currentWinStreak }) {
    return (
        <div className={styles.scoreBoard}>
            <div>Win: {wins}</div>
            <div>Loss: {losses}</div>
            <div>Draw: {draws}</div>
            <div>Current Win Streak: {currentWinStreak}</div>
        </div>
    )
}