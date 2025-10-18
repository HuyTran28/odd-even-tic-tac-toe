import Board from "./Board";
import GameInfo from "./GameInfo";
import ScoreBoard from "./ScoreBoard";
import { useGame } from "../hooks/useGame";
import styles from './Game.module.css';
import React from "react";

export default function Game() {
    const [chaosMode, setChaosMode] = React.useState(false);
    const {
        board,
        pendingBoard,
        winner,
        winnerCombination,
        player,
        room,
        wins,
        losses,
        draws,
        currentWinStreak,
        opponentState,
        chooseSquare,
        resetGame
    } = useGame(chaosMode);
    
    return (
        <>
            <button onClick={() => setChaosMode((prev) => !prev)} style={{marginBottom: 12}}>
                {chaosMode ? "Disable Chaos Mode" : "Enable Chaos Mode"}
            </button>
            <div className={styles.gameContainer}>
                <Board 
                    board={board}
                    pendingBoard={pendingBoard}
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
                player={player}
                room={room}
                opponentState={opponentState}
            />
        </>
    )
}