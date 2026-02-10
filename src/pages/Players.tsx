import React, { useState } from 'react';
import { usePokerStore } from '../store/usePokerStore';
import { Plus, Trash2, User } from 'lucide-react';
import { formatDate } from '../utils/format';

export const Players = () => {
    const { players, addPlayer, removePlayer } = usePokerStore();
    const [newPlayerName, setNewPlayerName] = useState('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlayerName.trim()) {
            addPlayer(newPlayerName.trim());
            setNewPlayerName('');
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Players</h2>
                <span className="text-sm text-slate-400">{players.length} Total</span>
            </header>

            {/* Add Player Form */}
            <form onSubmit={handleAddPlayer} className="flex gap-2">
                <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="New player name..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                    type="submit"
                    disabled={!newPlayerName.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </form>

            {/* Player List */}
            <div className="space-y-3">
                {players.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No players yet. Add someone above!</p>
                    </div>
                ) : (
                    players.map((player) => (
                        <div
                            key={player.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">{player.name}</h3>
                                    <p className="text-xs text-slate-500">
                                        Joined {formatDate(player.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm(`Remove ${player.name}? Stats will remain but they won't appear in new sessions.`)) {
                                        removePlayer(player.id);
                                    }
                                }}
                                className="text-slate-600 hover:text-red-400 transition-colors p-2"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
