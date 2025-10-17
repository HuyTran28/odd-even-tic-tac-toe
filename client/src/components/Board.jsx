import styles from './Board.module.css'
import Square from './Square'
import { BOARD_SIZE } from '../constants/gameConstants';

export default function Board({ board = [], handleClick, winnerCombination = [] }) {
    const squares = Array.from({ length: BOARD_SIZE });

    return (
        <div className={styles.board}>
            {squares.map((_, i) => (
                <Square 
                    key={i} 
                    value={board[i]} 
                    handleClick={event => handleClick(i)} 
                    isWinner={winnerCombination.includes(i)}
                />
            ))}            
        </div>
    )
}