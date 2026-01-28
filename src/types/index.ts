export type Position = [number, number];

export interface Move {
    moveNumber: number;
    from: Position | null;
    to: Position;
    notation: string;
}

export type SolverMethod = 'none' | 'warnsdorff' | 'hybrid';

export interface GameStats {
    startTime: number;
    endTime: number | null;
    backtracks: number;
    algorithmSteps: number;
    solverMethod: SolverMethod;
}

export interface GameSettings {
    animationSpeed: number; // ms per move
    showPath: boolean;
    showHints: boolean;
    closedTour: boolean; // Require returning to start (65 moves)
}

export interface GameState {
    mode: 'auto' | 'manual';
    board: number[][]; // -1 = unvisited, 0+ = move number
    knightPosition: Position | null;
    moveHistory: Move[];
    status: 'setup' | 'playing' | 'solved' | 'stuck' | 'failed';
    stats: GameStats;
    settings: GameSettings;

    // Actions
    setMode: (mode: 'auto' | 'manual') => void;
    setStartParams: (pos: Position) => void;
    resetGame: () => void;
    makeMove: (to: Position) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    setBoard: (board: number[][]) => void;
    setStatus: (status: GameState['status']) => void;
    setKnightPosition: (pos: Position) => void;
    addToHistory: (move: Move) => void;
    incrementBacktracks: () => void;
    incrementAlgorithmSteps: () => void;
    setSolverStats: (method: SolverMethod, backtracks: number) => void;
}
