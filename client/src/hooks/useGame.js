import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { calculateWinner } from "../utils/gameLogic";
import { SCORE_KEY, BOARD_SIZE, FIRST_PLAYER, SECOND_PLAYER } from "../constants/gameConstants";

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
    const [board, setBoard] = useState(Array(BOARD_SIZE).fill(0));
    const [winner, setWinner] = useState(null);
    const [winnerCombination, setWinnerCombination] = useState([]);
    const socketRef = useRef(null);
    const [isPlayable, setIsPlayable] = useState(false);
    const [player, setPlayer] = useState(null);
    const [room, setRoom] = useState(null);
    const [{ wins, losses, draws, currentWinStreak }, setScore] = useState(getInitialScore());

    useEffect(() => {
        if (socketRef.current) return;
        const socket = io("http://localhost:8080");
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join");
        });

        socket.on("assign", (data) => {
            setPlayer(data.player);
            setRoom(data.room);
        });

        socket.on("start", () => {
            setIsPlayable(true);
        });

        socket.on("display", (data) => {
            setBoard((prevBoard) => {
                const newBoard = [...prevBoard];
                newBoard[data.index] = data.value;
                return newBoard;
            });
        });

        socket.on("reset", () => {
            setBoard(Array(BOARD_SIZE).fill(0))
            setWinner(null)
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

        if (winner === FIRST_PLAYER) {
            setScore(preScore => ({
                ...preScore,
                wins: preScore.wins + 1,
                currentWinStreak: preScore.currentWinStreak + 1
            }));
        } else if (winner === SECOND_PLAYER) {
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
        if (winner || !isPlayable) {
            return;
        }
        socketRef.current.emit('increment', {
            room,
            index,
            value: board[index]
        });
    };

    const resetGame = () => {
        socketRef.current.emit('reset', room);
    }

    return {
        board,
        winner,
        winnerCombination,
        player,
        wins,
        losses,
        draws,
        currentWinStreak,
        isPlayable,
        chooseSquare,
        resetGame
    };
}