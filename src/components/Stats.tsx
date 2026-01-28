import { useGameStore } from '../store/gameStore';
import { useState, useEffect } from 'react';

export const Stats = () => {
    const { moveHistory, status, mode, stats } = useGameStore();
    const [elapsed, setElapsed] = useState(0);

    const moveCount = moveHistory.length;
    const progress = Math.round((moveCount / 64) * 100);

    // Update elapsed time every 100ms while playing
    useEffect(() => {
        if (status === 'playing' && stats.startTime > 0) {
            const interval = setInterval(() => {
                setElapsed(Date.now() - stats.startTime);
            }, 100);
            return () => clearInterval(interval);
        } else if (stats.endTime) {
            setElapsed(stats.endTime - stats.startTime);
        } else if (stats.startTime === 0) {
            setElapsed(0);
        }
    }, [status, stats.startTime, stats.endTime]);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const tenths = Math.floor((ms % 1000) / 100);
        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${tenths}`;
        }
        return `${seconds}.${tenths}s`;
    };

    return (

        <div className="bg-husain-card p-6 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4 border border-husain-bg/20">
            <h2 className="text-xl font-bold text-husain-canvas">Statistics</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-husain-bg p-3 rounded border border-husain-earth/20">
                    <div className="text-xs text-husain-canvas/50 uppercase tracking-wider">Moves</div>
                    <div className="text-2xl font-mono text-husain-canvas">{moveCount} <span className="text-husain-canvas/40 text-lg">/ 64</span></div>
                </div>
                <div className="bg-husain-bg p-3 rounded border border-husain-earth/20">
                    <div className="text-xs text-husain-canvas/50 uppercase tracking-wider">Time</div>
                    <div className="text-2xl font-mono text-husain-canvas">{formatTime(elapsed)}</div>
                </div>
            </div>

            <div className="bg-husain-bg p-3 rounded border border-husain-earth/20">
                <div className="text-xs text-husain-canvas/50 uppercase tracking-wider">Status</div>
                <div className={`text-lg font-bold uppercase ${status === 'solved' ? 'text-emerald-500' :
                    status === 'stuck' ? 'text-husain-crimson' :
                        status === 'playing' ? 'text-husain-saffron' : 'text-husain-canvas/50'
                    }`}>
                    {status}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-husain-bg h-2 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-husain-saffron to-husain-crimson transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Solver method and backtracks for auto mode */}
            {mode === 'auto' && stats.solverMethod !== 'none' && (
                <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-husain-canvas/50">Method:</span>
                        <span className={stats.solverMethod === 'warnsdorff' ? 'text-emerald-400' : 'text-husain-saffron'}>
                            {stats.solverMethod === 'warnsdorff' ? 'Warnsdorff' : 'Warnsdorff + Backtracking'}
                        </span>
                    </div>
                    {stats.backtracks > 0 && (
                        <div className="flex justify-between">
                            <span className="text-husain-canvas/50">Backtracks:</span>
                            <span className="text-husain-saffron">{stats.backtracks.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Backtracks for manual mode */}
            {mode === 'manual' && stats.backtracks > 0 && (
                <div className="text-sm text-husain-saffron">Backtracks: {stats.backtracks}</div>
            )}
        </div>
    );
}
