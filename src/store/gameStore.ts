import { create } from 'zustand';
import { GameState, Position, Move, SolverMethod } from '../types';
import { toAlgebraic } from '../utils/chess';

const createEmptyBoard = () => Array(8).fill(null).map(() => Array(8).fill(-1));

export const useGameStore = create<GameState>((set) => ({
    mode: 'manual',
    board: createEmptyBoard(),
    knightPosition: null,
    moveHistory: [],
    status: 'setup',
    stats: {
        startTime: 0,
        endTime: null,
        backtracks: 0,
        algorithmSteps: 0,
        solverMethod: 'none' as SolverMethod,
    },
    settings: {
        animationSpeed: 500,
        showPath: true,
        showHints: true,
    },

    setMode: (mode) => set({ mode }),

    setStartParams: (pos: Position) => set((state) => {
        const newBoard = createEmptyBoard();
        newBoard[pos[0]][pos[1]] = 1; // Start is move 1

        return {
            board: newBoard,
            knightPosition: pos,
            status: state.mode === 'auto' ? 'playing' : 'playing', // If auto, will trigger effect
            moveHistory: [{
                moveNumber: 1,
                from: null,
                to: pos,
                notation: toAlgebraic(pos)
            }],
            stats: {
                startTime: Date.now(),
                endTime: null,
                backtracks: 0,
                algorithmSteps: 0,
                solverMethod: 'none' as SolverMethod,
            }
        };
    }),

    resetGame: () => set({
        board: createEmptyBoard(),
        knightPosition: null,
        moveHistory: [],
        status: 'setup',
        stats: {
            startTime: 0,
            endTime: null,
            backtracks: 0,
            algorithmSteps: 0,
            solverMethod: 'none' as SolverMethod,
        }
    }),

    makeMove: (to: Position) => set((state) => {
        if (!state.knightPosition) return state;

        // Assume validation is done before calling this for manual mode
        // For auto mode, the algorithm calls this

        const moveNum = state.moveHistory.length + 1;
        const newBoard = [...state.board.map(row => [...row])];
        newBoard[to[0]][to[1]] = moveNum;

        const from = state.knightPosition;
        const notation = `${toAlgebraic(from)}→${toAlgebraic(to)}`; // Simple notation

        return {
            board: newBoard,
            knightPosition: to,
            moveHistory: [...state.moveHistory, {
                moveNumber: moveNum,
                from,
                to,
                notation
            }],
            // Check completion
            status: state.moveHistory.length + 1 === 64 ? 'solved' : state.status,
            stats: state.moveHistory.length + 1 === 64
                ? { ...state.stats, endTime: Date.now() }
                : state.stats
        };
    }),

    updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
    })),

    // Low level setters for algorithms
    setBoard: (board) => set({ board }),
    setStatus: (status) => set((state) => ({
        status,
        stats: (status === 'stuck' || status === 'solved') && !state.stats.endTime
            ? { ...state.stats, endTime: Date.now() }
            : state.stats
    })),
    setKnightPosition: (pos) => set({ knightPosition: pos }),
    addToHistory: (move: Move) => set((state) => ({ moveHistory: [...state.moveHistory, move] })),
    incrementBacktracks: () => set((state) => ({ stats: { ...state.stats, backtracks: state.stats.backtracks + 1 } })),
    incrementAlgorithmSteps: () => set((state) => ({ stats: { ...state.stats, algorithmSteps: state.stats.algorithmSteps + 1 } })),
    setSolverStats: (method: SolverMethod, backtracks: number) => set((state) => ({
        stats: { ...state.stats, solverMethod: method, backtracks }
    })),
}));
