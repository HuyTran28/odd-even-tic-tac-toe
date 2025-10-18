const { FIRST_PLAYER, SECOND_PLAYER } = require("./gameConstants");

function calculateWinner(board) {
    const winnerSet = [
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24],

        [0, 5, 10, 15, 20],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],

        [0, 6, 12, 18, 24],
        [4, 8, 12, 16, 20]
    ]

    for (let set of winnerSet) {
        if (set.every(index => board[index] % 2 === 1)) 
            return {winner: FIRST_PLAYER, combination: set};
        if (set.every(index => board[index] % 2 === 0 && board[index] !== 0))
            return {winner: SECOND_PLAYER, combination: set};
    }
    return {winner: null, combination: []};
}

module.exports = { calculateWinner };