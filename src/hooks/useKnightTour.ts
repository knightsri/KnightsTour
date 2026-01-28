import { useGameStore } from '../store/gameStore';
import { getValidMoves, canKnightReach } from '../utils/validation';
import { Position } from '../types';
import { useAnimation } from './useAnimation';
import { useEffect } from 'react';

export const useKnightTour = () => {
    const store = useGameStore();

    // Initialize animation engine
    useAnimation();

    const handleSquareClick = (pos: Position) => {
        if (store.status === 'setup') {
            store.setStartParams(pos);
        } else if (store.status === 'playing' && store.mode === 'manual') {
            if (store.knightPosition) {
                const validMoves = getValidMoves(store.knightPosition, store.board);
                const isValid = validMoves.some(m => m[0] === pos[0] && m[1] === pos[1]);

                // For closed tour: after 64 moves, allow returning to start
                const startPos = store.moveHistory[0]?.to;
                const isClosingMove = store.settings.closedTour &&
                    store.moveHistory.length === 64 &&
                    startPos &&
                    pos[0] === startPos[0] &&
                    pos[1] === startPos[1] &&
                    canKnightReach(store.knightPosition, pos);

                if (isValid || isClosingMove) {
                    store.makeMove(pos);
                }
            }
        }
    };

    // Check for stuck state in manual mode
    useEffect(() => {
        if (store.mode === 'manual' && store.status === 'playing' && store.knightPosition) {
            const validMoves = getValidMoves(store.knightPosition, store.board);
            const targetMoves = store.settings.closedTour ? 65 : 64;

            // For closed tour at move 64, check if we can return to start
            if (store.settings.closedTour && store.moveHistory.length === 64) {
                const startPos = store.moveHistory[0]?.to;
                const canClose = startPos && canKnightReach(store.knightPosition, startPos);
                if (!canClose) {
                    store.setStatus('stuck');
                }
                return;
            }

            if (validMoves.length === 0) {
                if (store.moveHistory.length >= targetMoves) {
                    // Solved handled by makeMove
                } else {
                    store.setStatus('stuck');
                }
            }
        }
    }, [store.knightPosition, store.status, store.mode, store.board, store.settings.closedTour, store.moveHistory]);

    return {
        ...store,
        handleSquareClick
    };
};
