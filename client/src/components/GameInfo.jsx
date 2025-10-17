import styles from "./GameInfo.module.css"

export default function GameInfo({ winner, resetGame, player, room, opponentState }) {
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
            <div>Your room ID: {room}</div>
            {opponentState === -1 && <div>Waiting for opponent to join...</div>}
            {opponentState === 1 && <div>Opponent left the game. Please reset the game.</div>}
            <button className={styles.button} onClick={() => resetGame()}>Reset</button>
        </>
    )
}