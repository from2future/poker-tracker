import { useMemo } from 'react';
import { usePokerStore } from '../store/usePokerStore';
import { formatCurrency, formatDate } from '../utils/format';
import { TrendingUp, DollarSign, Calendar, Trophy } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
    const { players, sessions, results } = usePokerStore();
    const navigate = useNavigate();

    const stats = useMemo(() => {
        const playerStats: Record<string, { name: string; profit: number; sessions: number }> = {};

        // Initialize with all players (even those with no games)
        players.forEach(p => {
            playerStats[p.id] = { name: p.name, profit: 0, sessions: 0 };
        });

        // Aggregate results
        results.forEach(r => {
            if (playerStats[r.playerId]) {
                playerStats[r.playerId].profit += (r.cashOut - r.buyIn);
                playerStats[r.playerId].sessions += 1;
            }
        });

        const sortedPlayers = Object.values(playerStats).sort((a, b) => b.profit - a.profit);
        const totalCurrentBankroll = results.reduce((acc, r) => acc + r.buyIn, 0); // Total money ever put in? No, Total Buy-in Volume

        // Total Net Discrepancy across all history (should be 0)
        const netDiscrepancy = results.reduce((acc, r) => acc + (r.cashOut - r.buyIn), 0);

        return {
            sortedPlayers,
            totalSessions: sessions.length,
            totalVolume: totalCurrentBankroll,
            netDiscrepancy,
            topWinner: sortedPlayers[0],
            biggestLoser: sortedPlayers[sortedPlayers.length - 1],
        };
    }, [players, sessions, results]);

    const recentSessions = [...sessions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Overview
            </h2>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">Sessions</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">Volume</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalVolume)}</p>
                </div>
            </div>

            {Math.abs(stats.netDiscrepancy) > 1 && (
                <div className="bg-amber-900/20 border border-amber-900/50 rounded-xl p-3 flex items-center justify-between text-xs text-amber-500">
                    <span>Unbalanced Cash-outs Detected</span>
                    <span className="font-bold">{stats.netDiscrepancy > 0 ? '+' : ''}{formatCurrency(stats.netDiscrepancy)}</span>
                </div>
            )}

            {/* Rankings */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Leaderboard
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {stats.sortedPlayers.length === 0 ? (
                        <p className="text-center py-6 text-slate-500 text-sm">No players yet</p>
                    ) : (
                        stats.sortedPlayers.map((p, i) => (
                            <div key={p.name} className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className={clsx("font-bold w-6 text-center",
                                        i === 0 ? "text-yellow-500" :
                                            i === 1 ? "text-slate-300" :
                                                i === 2 ? "text-amber-700" : "text-slate-600"
                                    )}>{i + 1}</span>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{p.name}</span>
                                        <span className="text-[10px] text-slate-500">{p.sessions} sessions</span>
                                    </div>
                                </div>
                                <span className={clsx("font-bold", p.profit > 0 ? "text-emerald-400" : p.profit < 0 ? "text-red-400" : "text-slate-500")}>
                                    {p.profit > 0 ? '+' : ''}{formatCurrency(p.profit)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Sessions */}
            <div>
                <h3 className="text-lg font-bold text-white mb-3">Recent Sessions</h3>
                {recentSessions.length === 0 ? (
                    <p className="text-slate-500 text-sm">No sessions played yet.</p>
                ) : (
                    <div className="space-y-3">
                        {recentSessions.map(s => (
                            <div key={s.id} onClick={() => navigate(`/sessions/${s.id}`)} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-slate-600 transition-colors">
                                <div>
                                    <p className="font-medium text-white">{formatDate(s.date)}</p>
                                    <p className="text-xs text-slate-500">{s.location}</p>
                                </div>
                                <TrendingUp className="w-5 h-5 text-slate-600" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
