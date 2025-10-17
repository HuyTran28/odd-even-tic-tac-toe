import styles from "./GameInfo.module.css"

export default function GameInfo({ winner, resetGame, player, isPlayable }) {
    return (
        <>
            {winner ? (
                <div>
                    {winner === "Draw"
                        ? "Draw"
                        : winner === player
                            ? "You are the winner!"
                            : "Try better next time!"}
                </div>
            ) : (
                <div>You are {player} player</div>
            )}
            {!isPlayable && <div>Waiting for opponent to join...</div>}
            <button className={styles.button} onClick={() => resetGame()}>Reset</button>
        </>
    )
}