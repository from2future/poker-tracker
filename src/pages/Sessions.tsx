import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { usePokerStore } from '../store/usePokerStore';
import { formatDate } from '../utils/format';

export const Sessions = () => {
    const { sessions, addSession } = usePokerStore();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleCreateSession = (e: React.FormEvent) => {
        e.preventDefault();
        const id = addSession(new Date(date).toISOString(), 'Home Game', notes.trim());
        setIsCreating(false);
        setNotes('');
        navigate(`/sessions/${id}`);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Sessions</h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-medium">New Session</span>
                </button>
            </header>

            {isCreating && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleCreateSession} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Notes (Optional)</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. $20 Buy-in"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Notes (Optional)</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. $20 Buy-in"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                Start Session
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {sessions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No sessions yet.</p>
                        <p className="text-sm">Start a new game above!</p>
                    </div>
                ) : (
                    sessions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((session) => (
                            <div
                                key={session.id}
                                onClick={() => navigate(`/sessions/${session.id}`)}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-colors group"
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(session.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                        <span>{session.location}</span>
                                    </div>
                                    {session.notes && (
                                        <p className="text-xs text-slate-500 ml-6">{session.notes}</p>
                                    )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};
