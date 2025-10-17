import Board from "./Board";
import GameInfo from "./GameInfo";
import ScoreBoard from "./ScoreBoard";
import { useGame } from "../hooks/useGame";
import styles from './Game.module.css';

export default function Game() {
    const {
        board,
        winner,
        winnerCombination,
        totalPosNum,
        durationMs,
        wins,
        losses,
        draws,
        currentWinStreak,
        chooseSquare,
        resetGame
    } = useGame();
    
    return (
        <>
            <div className={styles.gameContainer}>
                <Board 
                    board={board} 
                    handleClick={chooseSquare} 
                    winnerCombination={winnerCombination}
                />
                <ScoreBoard 
                    wins={wins} 
                    losses={losses} 
                    draws={draws} 
                    currentWinStreak={currentWinStreak} 
                />
            </div>
            <GameInfo 
                winner={winner} 
                resetGame={resetGame} 
                totalPosNum={totalPosNum}
                durationMs={durationMs}    
            />
        </>
    )
}