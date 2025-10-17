import { calculateWinner } from "./gameLogic";

const minimax = (board, depth, isMaximizing, alpha=-Infinity, beta=Infinity) => {
    const { winner } = calculateWinner(board);
    
    // Base case: if there's a winner, return a score based on who won and depth
    // AI (O) wins: positive score, Human (X) wins: negative score
    // Depth is subtracted/added to prefer quicker wins/slower losses
    if (winner) {
        let score = 0;
        if (winner === "X") score = depth - 10; // Human win: negative, worse if sooner
        else if (winner === "O") score = 10 - depth; // AI win: positive, better if sooner
        return {score, posNum: 1};
    }

    // If maximizing (AI's turn), find the move that maximizes the score
    if (isMaximizing) {
        let bestScore = -Infinity;
        let totalPosNum = 0;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                const newBoard = [...board];
                newBoard[i] = "O"; // AI move
                const {score, posNum} = minimax(newBoard, depth + 1, false, alpha, beta);
                
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, score);
                totalPosNum += posNum;

                // Alpha-beta pruning: stop exploring if this branch won't be chosen
                if (alpha >= beta) break;
            }
        }
        return {score: bestScore, posNum: totalPosNum};
    } else {
        // If minimizing (human's turn), find the move that minimizes the score
        let bestScore = Infinity;
        let totalPosNum = 0;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                const newBoard = [...board];
                newBoard[i] = "X"; // Human move
                const {score, posNum} = minimax(newBoard, depth + 1, true, alpha, beta);

                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, score);
                totalPosNum += posNum;

                // Alpha-beta pruning: stop exploring if this branch won't be chosen
                if (alpha >= beta) break;
            }
        }
        return {score: bestScore, posNum: totalPosNum};
    }
}

const findBestMove = (board) => {
    const start = performance.now();

    let bestScore = -Infinity;
    let move = null;
    let totalPosNum = 0;
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
            const newBoard = [...board];
            newBoard[i] = "O"; // AI move
            
            const {score, posNum} = minimax(newBoard, 0, false);
            totalPosNum += posNum;

            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    const end = performance.now();
    const durationMs = end - start;

    return {move, totalPosNum, durationMs};
}

export {findBestMove};