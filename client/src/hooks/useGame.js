import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { calculateWinner } from "../utils/gameLogic";
import { BOARD_SIZE } from "../constants/gameConstants";

export function useGame() {
    const [board, setBoard] = useState(Array(BOARD_SIZE).fill(0));
    const [winner, setWinner] = useState(null);
    const [winnerCombination, setWinnerCombination] = useState([]);
    const [opponentState, setOpponentState] = useState(-1);
    const [room, setRoom] = useState(null);
    const [{ wins, losses, draws, currentWinStreak }, setScore] = useState({wins: 0, losses: 0, draws: 0, currentWinStreak: 0});

    const socketRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (socketRef.current) return;
        const socket = io("http://localhost:8080");
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join");
        });

        socket.on("assign", (data) => {
            playerRef.current = data.player;
            setRoom(data.room);
        });

        socket.on("start", () => {
            setOpponentState(0);
        });

        socket.on("display", (data) => {
            setBoard((prevBoard) => {
                const newBoard = [...prevBoard];
                newBoard[data.index] = data.value;
                return newBoard;
            });
        });

        socket.on("playerLeft", () => {
            setOpponentState(1);
            setWinner(playerRef.current);
        });

        socket.on("reset", () => {
            setOpponentState(prev => prev === 1 ? -1 : prev);
            setBoard(Array(BOARD_SIZE).fill(0));
            setWinner(null);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [])

    useEffect(() => {
        if (winner === null) return;

        let newScore = {};
        if (winner === "Draw") {
            newScore = {
                wins,
                losses,
                draws: draws + 1,
                currentWinStreak: 0
            };
        }
        else if (winner === playerRef.current) {
            newScore = {
                wins: wins + 1,
                losses,
                draws,
                currentWinStreak: currentWinStreak + 1
            };
        }
        else {
            newScore = {
                wins,
                losses: losses + 1,
                draws,
                currentWinStreak: 0
            };
        }
        setScore(newScore);
    }, [winner])

    useEffect(() => {
        const { winner, combination } = calculateWinner(board)
        setWinner(winner);
        setWinnerCombination(combination);
    }, [board])

    const chooseSquare = (index) => {
        if (winner || opponentState !== 0) {
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
        player: playerRef.current,
        room,
        wins,
        losses,
        draws,
        currentWinStreak,
        opponentState,
        chooseSquare,
        resetGame
    };
}