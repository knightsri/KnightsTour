import { Position } from '../types';
import { getValidMoves, KNIGHT_MOVES } from '../utils/validation';
import { isValidPos } from '../utils/chess';

/**
 * Calculate corner/edge score for Pohl's tie-breaker.
 * Lower distance to edge = higher priority (helps avoid getting trapped).
 */
function cornerEdgeScore(pos: Position): number {
    const [r, c] = pos;
    const distFromEdge = Math.min(r, 7 - r, c, 7 - c);
    return -distFromEdge; // Negative so lower distance = higher score
}

/**
 * Get the degree (number of onward moves) for a position on a board.
 */
function getDegree(pos: Position, board: number[][]): number {
    const [x, y] = pos;
    let degree = 0;
    for (const [dx, dy] of KNIGHT_MOVES) {
        const nx = x + dx;
        const ny = y + dy;
        if (isValidPos([nx, ny]) && board[nx][ny] === -1) {
            degree++;
        }
    }
    return degree;
}

/**
 * Enhanced Warnsdorff's heuristic with Pohl's tie-breaker.
 * Returns the best next move, or null if no moves available.
 */
export const getBestMove = (current: Position, board: number[][]): Position | null => {
    const moves = getValidMoves(current, board);

    if (moves.length === 0) return null;

    // Calculate degree and edge score for each move
    const movesWithScore = moves.map(move => {
        board[move[0]][move[1]] = 999; // Temporary mark
        const degree = getDegree(move, board);
        board[move[0]][move[1]] = -1; // Reset
        const edgeScore = cornerEdgeScore(move);
        return { move, degree, edgeScore };
    });

    // Sort by degree (ascending), then by edge score (descending = closer to edge)
    movesWithScore.sort((a, b) => {
        if (a.degree !== b.degree) {
            return a.degree - b.degree;
        }
        return b.edgeScore - a.edgeScore;
    });

    return movesWithScore[0].move;
};
