import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { calculateWinner } from "../utils/gameLogic";
import { SCORE_KEY } from "../constants/gameConstants";

function getInitialScore() {
    const savedScore = localStorage.getItem(SCORE_KEY);
    if (savedScore) {
        return JSON.parse(savedScore);
    }
    return {
        wins: 0,
        losses: 0,
        draws: 0,
        currentWinStreak: 0
    };
}

export function useGame() {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [winner, setWinner] = useState(null);
    const [winnerCombination, setWinnerCombination] = useState([]);
    const socketRef = useRef(null);
    const playerRef = useRef(null);
    const [totalPosNum, setTotalPosNum] = useState(0);
    const [durationMs, setDurationMs] = useState(0);
    const [{ wins, losses, draws, currentWinStreak }, setScore] = useState(getInitialScore());

    useEffect(() => {
        if (socketRef.current) return;
        const socket = io("http://localhost:8080");
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join");
        });

        socket.on("start", (data) => {
            playerRef.current = data.player;
            setIsPlayerTurn(data.player === "X");
        });

        socket.on("display", (data) => {
            setBoard(data.board);
            setIsPlayerTurn(data.nextPlayer === playerRef.current);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [])

    useEffect(() => {
        localStorage.setItem(SCORE_KEY, JSON.stringify({ wins, losses, draws, currentWinStreak }));
    }, [wins, losses, draws, currentWinStreak]);

    useEffect(() => {
        if (!winner) return;

        if (winner === "X") {
            setScore(preScore => ({
                ...preScore,
                wins: preScore.wins + 1,
                currentWinStreak: preScore.currentWinStreak + 1
            }));
        } else if (winner === "O") {
            setScore(preScore => ({
                ...preScore,
                losses: preScore.losses + 1,
                currentWinStreak: 0
            }));
        } else {
            setScore(preScore => ({
                ...preScore,
                draws: preScore.draws + 1,
                currentWinStreak: 0
            }));
        }
    }, [winner])

    useEffect(() => {
        const { winner, combination } = calculateWinner(board)
        setWinner(winner);
        setWinnerCombination(combination);
    }, [board])

    const chooseSquare = (index) => {
        if (board[index] || winner || !isPlayerTurn) {
            return;
        }
        const newBoard = [...board];
        newBoard[index] = playerRef.current;
        socketRef.current.emit("move", {
            board: newBoard,
            nextPlayer: playerRef.current === "X" ? "O" : "X"
        });
    };

    useEffect(() => {
        if (!socketRef.current) return;
        const socket = socketRef.current;
        const handleMove = (data) => {
            setBoard(data.board);
            setIsPlayerTurn(data.nextPlayer === playerRef.current);
        };
        socket.on("move", handleMove);
        return () => {
            socket.off("move", handleMove);
        };
    }, []);

    const resetGame = () => {
        setBoard(Array(9).fill(null))
        setWinner(null)
        setTotalPosNum(0)
        setDurationMs(0)
        if (socketRef.current) {
            socketRef.current.emit("reset");
        }
    }

    return {
        board,
        isPlayerTurn,
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
    };
}