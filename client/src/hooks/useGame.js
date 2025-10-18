import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { BOARD_SIZE } from "../constants/gameConstants";

export function useGame(chaosMode = false) {
    const [board, setBoard] = useState(Array(BOARD_SIZE).fill(0));
    const [pendingBoard, setPendingBoard] = useState(Array(BOARD_SIZE).fill(false));
    const [winner, setWinner] = useState(null);
    const [winnerCombination, setWinnerCombination] = useState([]);
    const [opponentState, setOpponentState] = useState(-1);
    const [room, setRoom] = useState(null);
    const [{ wins, losses, draws, currentWinStreak }, setScore] = useState({wins: 0, losses: 0, draws: 0, currentWinStreak: 0});

    const socketRef = useRef(null);
    const playerRef = useRef(null);
    const winnerRef = useRef(winner);

    useEffect(() => {
        winnerRef.current = winner;
    }, [winner]);

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
            if (winnerRef.current !== null) return;
            console.log("Display event received:", data);
            
            setPendingBoard((prevBoard) => {
                const newBoard = [...prevBoard];
                newBoard[data.index] = false;
                return newBoard;
            });
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

        socket.on("win", (data) => {
            setWinner(data.winner);
            setWinnerCombination(data.combination);
        });

        socket.on("reset", () => {
            setOpponentState(prev => prev === 1 ? -1 : prev);
            setBoard(Array(BOARD_SIZE).fill(0));
            setWinner(null);
            setWinnerCombination([]);
            setPendingBoard(Array(BOARD_SIZE).fill(false));
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

    const chooseSquare = (index) => {
        if (winner || opponentState !== 0) {
            return;
        }

        setPendingBoard((prev) => {
            const newBoard = [...prev];
            newBoard[index] = true;
            return newBoard;
        });

        const emitIncrement = () => {
            socketRef.current.emit('increment', {
                room,
                index
            });
        };
        if (chaosMode) {
            const delay = Math.random() * 2000;
            setTimeout(emitIncrement, delay);
        } else {
            emitIncrement();
        }
    };

    const resetGame = () => {
        const emitReset = () => {
            socketRef.current.emit('reset', room);
        };
        if (chaosMode) {
            const delay = Math.random() * 1000;
            setTimeout(emitReset, delay);
        } else {
            emitReset();
        }
    }

    return {
        board,
        pendingBoard,
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