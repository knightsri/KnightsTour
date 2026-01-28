import { Position, SolverMethod } from '../types';
import { getValidMoves, KNIGHT_MOVES } from '../utils/validation';
import { isValidPos } from '../utils/chess';

export interface SolverResult {
    success: boolean;
    path: Position[];
    method: SolverMethod;
    backtracks: number;
}

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
 * Returns moves sorted by: (1) fewest onward moves, (2) closer to corners/edges.
 */
function getSortedMoves(current: Position, board: number[][]): Position[] {
    const moves = getValidMoves(current, board);

    if (moves.length === 0) return [];

    // Calculate degree for each move (temporarily mark to check onward moves)
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
        return b.edgeScore - a.edgeScore; // Higher edge score = closer to edge
    });

    return movesWithScore.map(m => m.move);
}

/**
 * Attempt to solve using pure Warnsdorff with enhanced tie-breaking.
 * Returns the path if successful, or partial path if stuck.
 */
function solveWarnsdorff(start: Position): { path: Position[]; complete: boolean } {
    const board: number[][] = Array(8).fill(null).map(() => Array(8).fill(-1));
    const path: Position[] = [start];

    board[start[0]][start[1]] = 1;
    let current = start;

    for (let moveNum = 2; moveNum <= 64; moveNum++) {
        const sortedMoves = getSortedMoves(current, board);

        if (sortedMoves.length === 0) {
            return { path, complete: false };
        }

        const nextMove = sortedMoves[0];
        board[nextMove[0]][nextMove[1]] = moveNum;
        path.push(nextMove);
        current = nextMove;
    }

    return { path, complete: true };
}

/**
 * Backtracking solver using DFS with Warnsdorff ordering.
 * Continues from a partial solution.
 */
function solveWithBacktracking(
    initialPath: Position[],
    maxBacktracks: number = 100000
): { path: Position[]; complete: boolean; backtracks: number } {
    // Rebuild board state from initial path
    const board: number[][] = Array(8).fill(null).map(() => Array(8).fill(-1));
    for (let i = 0; i < initialPath.length; i++) {
        const [x, y] = initialPath[i];
        board[x][y] = i + 1;
    }

    let backtracks = 0;

    // Stack-based DFS: each entry is { path, board }
    // Start by exploring alternatives from the last position
    type StackEntry = {
        path: Position[];
        board: number[][];
        moveIndex: number; // Which move option we're trying
    };

    // Find where to start backtracking from
    // Try removing moves from the end and exploring alternatives
    const stack: StackEntry[] = [];

    // Initialize: try alternatives from each position in the path (from end to start)
    for (let backtrackDepth = 1; backtrackDepth <= initialPath.length - 1; backtrackDepth++) {
        if (backtracks >= maxBacktracks) break;

        const truncatedPath = initialPath.slice(0, initialPath.length - backtrackDepth);
        const truncatedBoard: number[][] = Array(8).fill(null).map(() => Array(8).fill(-1));

        for (let i = 0; i < truncatedPath.length; i++) {
            const [x, y] = truncatedPath[i];
            truncatedBoard[x][y] = i + 1;
        }

        const lastPos = truncatedPath[truncatedPath.length - 1];
        const sortedMoves = getSortedMoves(lastPos, truncatedBoard);

        // Skip the move that was originally taken (if we know it)
        const originalNextMove = initialPath[truncatedPath.length];
        const alternativeMoves = sortedMoves.filter(
            m => !originalNextMove || m[0] !== originalNextMove[0] || m[1] !== originalNextMove[1]
        );

        for (const nextMove of alternativeMoves) {
            backtracks++;
            if (backtracks >= maxBacktracks) break;

            // Try completing the tour from this alternative
            const newBoard = truncatedBoard.map(row => [...row]);
            const newPath = [...truncatedPath];

            newBoard[nextMove[0]][nextMove[1]] = newPath.length + 1;
            newPath.push(nextMove);

            // Continue with Warnsdorff from here
            let current = nextMove;
            let success = true;

            while (newPath.length < 64) {
                const moves = getSortedMoves(current, newBoard);
                if (moves.length === 0) {
                    success = false;
                    break;
                }
                const next = moves[0];
                newBoard[next[0]][next[1]] = newPath.length + 1;
                newPath.push(next);
                current = next;
            }

            if (success && newPath.length === 64) {
                return { path: newPath, complete: true, backtracks };
            }
        }
    }

    // If simple backtracking didn't work, try full DFS
    return fullDFS(initialPath[0], maxBacktracks - backtracks, backtracks);
}

/**
 * Full DFS solver with Warnsdorff ordering for move selection.
 */
function fullDFS(
    start: Position,
    maxIterations: number,
    initialBacktracks: number
): { path: Position[]; complete: boolean; backtracks: number } {
    const board: number[][] = Array(8).fill(null).map(() => Array(8).fill(-1));
    board[start[0]][start[1]] = 1;

    const path: Position[] = [start];
    const moveStack: Position[][] = []; // Stack of remaining moves to try at each depth

    let backtracks = initialBacktracks;

    // Initialize with sorted moves from start
    moveStack.push(getSortedMoves(start, board));

    while (path.length < 64 && backtracks < maxIterations + initialBacktracks) {
        const currentMoves = moveStack[moveStack.length - 1];

        if (currentMoves.length === 0) {
            // Backtrack
            if (path.length <= 1) {
                // Can't backtrack further
                break;
            }

            const removed = path.pop()!;
            board[removed[0]][removed[1]] = -1;
            moveStack.pop();
            backtracks++;
            continue;
        }

        // Try the next move
        const nextMove = currentMoves.shift()!;
        board[nextMove[0]][nextMove[1]] = path.length + 1;
        path.push(nextMove);

        if (path.length < 64) {
            moveStack.push(getSortedMoves(nextMove, board));
        }
    }

    return {
        path,
        complete: path.length === 64,
        backtracks
    };
}

/**
 * Main solver function: tries Warnsdorff first, falls back to backtracking.
 */
export function solveKnightsTour(start: Position): SolverResult {
    // Phase 1: Try enhanced Warnsdorff
    const warnsdorffResult = solveWarnsdorff(start);

    if (warnsdorffResult.complete) {
        return {
            success: true,
            path: warnsdorffResult.path,
            method: 'warnsdorff',
            backtracks: 0
        };
    }

    // Phase 2: Backtracking from stuck position
    const backtrackResult = solveWithBacktracking(warnsdorffResult.path);

    if (backtrackResult.complete) {
        return {
            success: true,
            path: backtrackResult.path,
            method: 'hybrid',
            backtracks: backtrackResult.backtracks
        };
    }

    // Phase 3: Full DFS if partial backtracking failed
    const dfsResult = fullDFS(start, 500000, 0);

    return {
        success: dfsResult.complete,
        path: dfsResult.path,
        method: 'hybrid',
        backtracks: dfsResult.backtracks
    };
}
