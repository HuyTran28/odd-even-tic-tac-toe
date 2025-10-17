import { findBestMove } from "./ai";

const calculateWinner = (board) => {
    const winnerSet = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]

    for (let set of winnerSet) {
        const [a, b, c] = set;
        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return {winner: board[a], combination: set};
        }
    }

    if (!board.includes(null)) {
        return {winner: 'Draw', combination: []};
    }

    // Always return an object
    return {winner: null, combination: []};
}

const getNextMove = (mode, board = null) => {
    if (mode === "hard" && board) return findBestMove(board)
    else {
        const availableMoves = board
            .map((val, idx) => val === null ? idx : null)
            .filter(val => val !== null);
        return {move: availableMoves[Math.floor(Math.random() * availableMoves.length)]};
    }
}

export {calculateWinner, getNextMove}