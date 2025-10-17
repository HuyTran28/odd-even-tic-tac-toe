import styles from './Square.module.css'

export default function Square ({ value, handleClick, isWinner }) {
    return (
        <button className={`${styles.square} ${isWinner ? styles.winner : ''}`} onClick={handleClick}>{value}</button>
    )
};