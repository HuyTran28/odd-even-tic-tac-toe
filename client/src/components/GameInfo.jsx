import styles from "./GameInfo.module.css"
import ToggleMode from "./ToggleMode"

export default function GameInfo({ winner, resetGame, isPlayerTurn, totalPosNum, durationMs }) {    
    return (
        <>
            {winner ? 
                <div>{winner !== "Draw" ? `Winner ${winner}` : "Draw"}</div> : 
                // <div>Next player: {xIsNext ? "X" : "O"}</div>}
                <div>{isPlayerTurn ? "Your turn" : "Please wait for opponent's turn"}</div>
            }
        {/* {mode === "hard" &&
            <>
                <div>Total positions evaluated: {totalPosNum}</div>
                <div>Duration: {durationMs}ms</div>
            </>
        } */}
            <button className={styles.button} onClick={() => resetGame()}>Reset</button>
            {/* <ToggleMode mode={mode} setMode={setMode} /> */}
        </>
    )
}