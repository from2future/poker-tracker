import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, X, Check } from 'lucide-react';
import { usePokerStore } from '../store/usePokerStore';
import { formatDate, formatCurrency } from '../utils/format';
import clsx from 'clsx';

const NetInput = ({
    value,
    onChange
}: {
    value: number,
    onChange: (val: number) => void
}) => {
    const [localValue, setLocalValue] = useState(value === 0 ? '' : value.toString());

    // Sync validation on blur
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);

        if (val === '' || val === '-') return;

        const num = parseFloat(val);
        if (!isNaN(num) && !val.endsWith('.')) {
            onChange(num);
        }
    };

    const handleBlur = () => {
        const num = parseFloat(localValue);
        if (isNaN(num)) {
            onChange(0);
            setLocalValue('');
        } else {
            onChange(num);
            setLocalValue(num.toString());
        }
    };

    return (
        <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
                type="text"
                inputMode="decimal"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={clsx(
                    "w-full bg-slate-950 border border-slate-700 rounded-lg pl-6 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500",
                    (parseFloat(localValue) || 0) > 0 ? "text-emerald-400" : (parseFloat(localValue) || 0) < 0 ? "text-red-400" : "text-white"
                )}
                placeholder="0"
            />
        </div>
    );
};

export const SessionDetails = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { sessions, players, deleteSession, setResult, getSessionResults, addPlayer } = usePokerStore();

    const session = sessions.find((s) => s.id === sessionId);
    const sessionResults = getSessionResults(sessionId || '');

    // Local state for "Add Player"
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [isNetMode, setIsNetMode] = useState(false);

    // Players not yet in this session
    const availablePlayers = players.filter(
        (p) => !sessionResults.some((r) => r.playerId === p.id)
    );

    if (!session) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Session not found.</p>
                <button onClick={() => navigate('/sessions')} className="text-emerald-400 mt-2">
                    Back to Sessions
                </button>
            </div>
        );
    }

    const handleAddPlayer = () => {
        if (selectedPlayerId) {
            setResult({
                sessionId: session.id,
                playerId: selectedPlayerId,
                buyIn: 0,
                cashOut: 0,
            });
            setSelectedPlayerId('');
        }
    };

    const handleCreateAndAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlayerName.trim()) {
            const newId = await addPlayer(newPlayerName.trim());
            if (newId) {
                setResult({
                    sessionId: session.id,
                    playerId: newId,
                    buyIn: 0,
                    cashOut: 0,
                });
                setNewPlayerName('');
                setIsCreatingPlayer(false);
            }
        }
    };

    const handleUpdateResult = (playerId: string, field: 'buyIn' | 'cashOut', value: string) => {
        const numValue = parseFloat(value) || 0;
        const currentResult = sessionResults.find((r) => r.playerId === playerId);
        if (currentResult) {
            setResult({
                ...currentResult,
                [field]: numValue,
            });
        }
    };

    const totals = useMemo(() => {
        return sessionResults.reduce(
            (acc, curr) => ({
                buyIn: acc.buyIn + curr.buyIn,
                cashOut: acc.cashOut + curr.cashOut,
                profit: acc.profit + (curr.cashOut - curr.buyIn),
            }),
            { buyIn: 0, cashOut: 0, profit: 0 }
        );
    }, [sessionResults]);

    return (
        <div className="space-y-6 pb-20">
            <header className="flex items-center gap-4">
                <button onClick={() => navigate('/sessions')} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-white">{formatDate(session.date)}</h2>
                    <p className="text-sm text-slate-400">{session.location}</p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => {
                            if (confirm("Delete this session?")) {
                                deleteSession(session.id);
                                navigate('/sessions');
                            }
                        }}
                        className="text-slate-600 hover:text-red-500 p-2"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Add Player Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <label className="block text-xs font-medium text-slate-400 mb-2">Add Player to Session</label>
                {isCreatingPlayer ? (
                    <form onSubmit={handleCreateAndAddPlayer} className="flex gap-2">
                        <input
                            type="text"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="New player name..."
                            autoFocus
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                            type="submit"
                            disabled={!newPlayerName.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-lg"
                        >
                            <Check className="w-6 h-6" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreatingPlayer(false)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2 rounded-lg"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </form>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <select
                                value={selectedPlayerId}
                                onChange={(e) => setSelectedPlayerId(e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                disabled={availablePlayers.length === 0}
                            >
                                <option value="">Select a player...</option>
                                {availablePlayers.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddPlayer}
                                disabled={!selectedPlayerId}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg"
                            >
                                <UserPlus className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mt-2 text-xs flex justify-between items-center">
                            {availablePlayers.length === 0 && sessionResults.length === 0 && players.length > 0 ? (
                                <span className="text-amber-500">All players added.</span>
                            ) : players.length === 0 ? (
                                <span className="text-slate-500">No players yet.</span>
                            ) : (
                                <span></span>
                            )}

                            <button
                                onClick={() => setIsCreatingPlayer(true)}
                                className="text-emerald-400 hover:text-emerald-300 font-medium"
                            >
                                + Create new player
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Input Mode Toggle */}
            <div className="flex justify-center">
                <div className="bg-slate-900 p-1 rounded-lg flex items-center gap-1 border border-slate-800">
                    <button
                        onClick={() => setIsNetMode(false)}
                        className={clsx(
                            "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                            !isNetMode ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                        )}
                    >
                        Standard (Buy-In/Out)
                    </button>
                    <button
                        onClick={() => setIsNetMode(true)}
                        className={clsx(
                            "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                            isNetMode ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                        )}
                    >
                        Net Profit Only
                    </button>
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-3">
                {sessionResults.map((result) => {
                    const player = players.find((p) => p.id === result.playerId);
                    const profit = result.cashOut - result.buyIn;
                    return (
                        <div
                            key={result.playerId}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                        >
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="font-medium text-white">{player?.name || 'Unknown'}</span>
                                <span className={clsx("font-bold", profit > 0 ? "text-emerald-400" : profit < 0 ? "text-red-400" : "text-slate-400")}>
                                    {formatCurrency(profit)}
                                </span>
                            </div>

                            {!isNetMode ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase text-slate-500 mb-1">Buy-In</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                            <input
                                                type="number"
                                                value={result.buyIn || ''}
                                                onChange={(e) => handleUpdateResult(result.playerId, 'buyIn', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-slate-500 mb-1">Cash-Out</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                            <input
                                                type="number"
                                                value={result.cashOut || ''}
                                                onChange={(e) => handleUpdateResult(result.playerId, 'cashOut', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (

                                <div>
                                    <label className="block text-[10px] uppercase text-slate-500 mb-1">Net Profit / Loss</label>
                                    <NetInput
                                        value={profit}
                                        onChange={(net) => {
                                            if (net >= 0) {
                                                handleUpdateResult(result.playerId, 'buyIn', '0');
                                                handleUpdateResult(result.playerId, 'cashOut', net.toString());
                                            } else {
                                                handleUpdateResult(result.playerId, 'buyIn', Math.abs(net).toString());
                                                handleUpdateResult(result.playerId, 'cashOut', '0');
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary Footer */}
            {sessionResults.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-1">
                    <div className="flex justify-between text-slate-400">
                        <span>Total Buy-In:</span>
                        <span>{formatCurrency(totals.buyIn)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>Total Cash-Out:</span>
                        <span>{formatCurrency(totals.cashOut)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-700">
                        <span>Net Discrepancy:</span>
                        <span className={clsx(totals.profit === 0 ? "text-emerald-400" : "text-amber-400")}>
                            {totals.profit > 0 ? '+' : ''}{formatCurrency(totals.profit)}
                        </span>
                    </div>
                    {totals.profit !== 0 && (
                        <p className="text-xs text-amber-500/80 pt-1 text-center">
                            To balance, Cash-Outs should equal Buy-Ins (Net $0).
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
