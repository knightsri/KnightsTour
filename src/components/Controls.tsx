import { useGameStore } from '../store/gameStore';

export const Controls = () => {
    const {
        mode,
        status,
        settings,
        setMode,
        resetGame,
        updateSettings
    } = useGameStore();

    return (
        <div className="flex flex-col gap-4 bg-husain-card p-6 rounded-lg shadow-lg w-full max-w-sm border border-husain-bg/20">
            <h2 className="text-xl font-bold text-husain-canvas mb-2">Controls</h2>

            {/* Mode Selection */}
            <div className="flex bg-husain-bg rounded-lg p-1">
                <button
                    onClick={() => setMode('manual')}
                    disabled={status === 'playing' || status === 'solved' || status === 'stuck'}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'manual'
                        ? 'bg-husain-saffron text-husain-bg shadow-md font-bold'
                        : 'text-husain-canvas/50 hover:text-husain-canvas'
                        }`}
                >
                    Manual
                </button>
                <button
                    onClick={() => setMode('auto')}
                    disabled={status === 'playing' || status === 'solved' || status === 'stuck'}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'auto'
                        ? 'bg-husain-saffron text-husain-bg shadow-md font-bold'
                        : 'text-husain-canvas/50 hover:text-husain-canvas'
                        }`}
                >
                    Auto-Solve
                </button>
            </div>

            {/* Speed Control (Auto Mode) */}
            {mode === 'auto' && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-husain-canvas/60">
                        <span>Fast</span>
                        <span>Slow</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={settings.animationSpeed}
                        onChange={(e) => updateSettings({ animationSpeed: Number(e.target.value) })}
                        className="w-full h-2 bg-husain-bg rounded-lg appearance-none cursor-pointer accent-husain-saffron"
                    />
                    <div className="text-center text-xs text-husain-canvas/60">
                        {settings.animationSpeed}ms / move
                    </div>
                </div>
            )}

            {/* Game Status Actions */}
            <div className="mt-4">
                {status === 'setup' && (
                    <div className="text-center p-3 bg-husain-bg/50 rounded border border-husain-earth/20 text-husain-canvas/80 text-sm">
                        Click any square to start
                    </div>
                )}

                {(status === 'playing' || status === 'solved' || status === 'stuck') && (
                    <button
                        onClick={resetGame}
                        className="w-full py-3 bg-husain-crimson hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-transform active:scale-95"
                    >
                        Reset Board
                    </button>
                )}
            </div>

            {/* Closed Tour Toggle */}
            <div className="flex items-center gap-2 mt-2">
                <input
                    type="checkbox"
                    id="closedTour"
                    checked={settings.closedTour}
                    onChange={(e) => updateSettings({ closedTour: e.target.checked })}
                    disabled={status === 'playing' || status === 'solved' || status === 'stuck'}
                    className="w-4 h-4 accent-husain-saffron rounded disabled:opacity-50"
                />
                <label htmlFor="closedTour" className="text-sm text-husain-canvas/80 cursor-pointer">
                    Closed tour (return to start)
                </label>
            </div>

            {/* Hints Toggle (Manual) */}
            {mode === 'manual' && (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="hints"
                        checked={settings.showHints}
                        onChange={(e) => updateSettings({ showHints: e.target.checked })}
                        className="w-4 h-4 accent-husain-saffron rounded"
                    />
                    <label htmlFor="hints" className="text-sm text-husain-canvas/80 cursor-pointer">Show valid moves</label>
                </div>
            )}
        </div>
    );
};
