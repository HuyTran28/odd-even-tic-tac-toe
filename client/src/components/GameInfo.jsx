import styles from "./GameInfo.module.css"
import ToggleMode from "./ToggleMode"

export default function GameInfo({ winner, resetGame, totalPosNum, durationMs }) {    
    return (
        <>
            {winner &&<div>{winner !== "Draw" ? `Winner ${winner}` : "Draw"}</div>}
            <button className={styles.button} onClick={() => resetGame()}>Reset</button>
        </>
    )
}