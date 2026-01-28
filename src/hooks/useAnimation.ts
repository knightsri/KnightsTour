import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { solveKnightsTour, SolverResult } from '../algorithms/solver';
import { Position } from '../types';

export const useAnimation = () => {
    const {
        mode,
        status,
        settings,
        makeMove,
        knightPosition,
        setStatus,
        setSolverStats,
        moveHistory
    } = useGameStore();

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const solutionRef = useRef<Position[] | null>(null);
    const moveIndexRef = useRef<number>(1); // Start at 1 since position 0 is the starting square

    useEffect(() => {
        // Compute solution when auto mode starts playing
        if (status === 'playing' && mode === 'auto' && knightPosition && moveHistory.length === 1) {
            const result: SolverResult = solveKnightsTour(knightPosition);

            if (result.success) {
                solutionRef.current = result.path;
                moveIndexRef.current = 1; // Skip the starting position
                setSolverStats(result.method, result.backtracks);
            } else {
                // Solver failed completely
                setStatus('failed');
                setSolverStats(result.method, result.backtracks);
                return;
            }
        }

        // Animate through pre-computed solution
        if (status === 'playing' && mode === 'auto' && solutionRef.current) {
            timerRef.current = setInterval(() => {
                const solution = solutionRef.current;
                const currentIndex = moveIndexRef.current;

                if (!solution || currentIndex >= solution.length) {
                    // Animation complete
                    if (timerRef.current) clearInterval(timerRef.current);
                    return;
                }

                const nextMove = solution[currentIndex];
                makeMove(nextMove);
                moveIndexRef.current = currentIndex + 1;

                // Check if we've completed the tour
                if (currentIndex + 1 >= 64) {
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            }, settings.animationSpeed);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, mode, settings.animationSpeed, knightPosition, moveHistory.length, makeMove, setStatus, setSolverStats]);

    // Reset solution when game resets
    useEffect(() => {
        if (status === 'setup') {
            solutionRef.current = null;
            moveIndexRef.current = 1;
        }
    }, [status]);
};
