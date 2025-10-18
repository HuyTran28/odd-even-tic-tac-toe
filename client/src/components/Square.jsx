import styles from './Square.module.css'

export default function Square ({ value, handleClick, isWinner, isPending }) {
    return (
        <button 
            className={`
                ${styles.square} 
                ${isWinner ? styles.winner : ''} 
                ${isPending ? styles.pending : ''}
                ${value % 2 === 0 ? styles.even : styles.odd}
            `} 
            onClick={handleClick}>{value}</button>
    )
};