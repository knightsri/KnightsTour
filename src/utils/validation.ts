import { Position } from '../types';
import { isValidPos } from './chess';

export const KNIGHT_MOVES = [
    [1, 2], [1, -2], [-1, 2], [-1, -2],
    [2, 1], [2, -1], [-2, 1], [-2, -1]
];

export const getValidMoves = (current: Position, board: number[][]): Position[] => {
    const [x, y] = current;
    const moves: Position[] = [];

    for (const [dx, dy] of KNIGHT_MOVES) {
        const newX = x + dx;
        const newY = y + dy;
        const newPos: Position = [newX, newY];

        if (isValidPos(newPos) && board[newX][newY] === -1) {
            moves.push(newPos);
        }
    }

    return moves;
};

export const isTourComplete = (board: number[][]): boolean => {
    return board.every(col => col.every(cell => cell !== -1));
};

/**
 * Check if position `from` can reach position `to` via a single knight move.
 */
export const canKnightReach = (from: Position, to: Position): boolean => {
    const dx = Math.abs(from[0] - to[0]);
    const dy = Math.abs(from[1] - to[1]);
    return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
};
