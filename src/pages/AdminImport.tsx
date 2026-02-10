import { useState } from 'react';
import { usePokerStore } from '../store/usePokerStore';
import { supabase } from '../lib/supabase';

// Raw data from Sheet + User Overrides
// BuyIn is fixed at 5.00
// CashOut = BuyIn + NetProfit
const DATA = [
    { name: 'Mithil', dates: { '2024-01-27': 7, '2024-02-09': 0.25 } },
    { name: 'Charlotte', dates: { '2024-01-27': -5.15, '2024-02-02': -2.3, '2024-02-09': -1.65 } },
    { name: 'Shivan', dates: { '2024-01-27': 5.9, '2024-02-02': 3.85, '2024-02-09': 1.75 } },
    { name: 'Matthew', dates: { '2024-01-27': -12.5, '2024-02-02': -7.5, '2024-02-09': -4.25 } },
    { name: 'Ray', dates: { '2024-01-27': -4.45, '2024-02-02': 0.85, '2024-02-09': 7.35 } },
    { name: 'SNS', dates: { '2024-01-27': 7.35, '2024-02-02': 0.35, '2024-02-09': 1.4 } }, // OVERRIDE applied (9.1 -> 7.35)
    { name: 'Simran', dates: { '2024-01-27': 6.85, '2024-02-02': -1.25, '2024-02-09': -1.4 } },
    { name: 'Jasmine', dates: { '2024-01-27': -5, '2024-02-09': -3.55 } },
    { name: 'Chiara', dates: { '2024-02-02': 7.2 } }, // OVERRIDE applied (7.7 -> 7.2)
    { name: 'Charlie', dates: { '2024-02-02': -5, '2024-02-09': 3.45 } },
    { name: 'Reanna', dates: { '2024-02-02': 3.8, '2024-02-09': -1.7 } },
    { name: 'Tom', dates: { '2024-02-09': 8.4 } }, // OVERRIDE applied (8.55 -> 8.4)
    { name: 'Anoush', dates: { '2024-02-09': -5.05 } },
    { name: 'Jack', dates: { '2024-02-09': -5 } },
];

const SESSIONS = [
    { date: '2024-01-27', location: 'Home Game' },
    { date: '2024-02-02', location: 'Home Game' },
    { date: '2024-02-09', location: 'Home Game' },
];

export const AdminImport = () => {
    const [status, setStatus] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const { addPlayer, addSession } = usePokerStore();

    const runImport = async () => {
        setIsRunning(true);
        setStatus([]);
        const addLog = (msg: string) => setStatus(prev => [...prev, msg]);

        try {
            // 1. Create Sessions
            addLog('Creating sessions...');
            const sessionMap: Record<string, string> = {}; // date -> id

            for (const sess of SESSIONS) {
                // Check if exists first to avoid duplicates if run multiple times
                const { data: existing } = await supabase
                    .from('sessions')
                    .select('id')
                    .eq('date', sess.date)
                    .single();

                if (existing) {
                    sessionMap[sess.date] = existing.id;
                    addLog(`Session ${sess.date} already exists: ${existing.id}`);
                } else {
                    const newId = await addSession(sess.date, sess.location, 'Imported History');
                    if (newId) {
                        sessionMap[sess.date] = newId;
                        addLog(`Created session ${sess.date}: ${newId}`);
                    } else {
                        addLog(`Failed to create session ${sess.date}`);
                    }
                }
            }

            // 2. Create Players & Results
            addLog('Processing players...');
            for (const p of DATA) {
                // Check/Create Player
                let playerId: string | null = null;
                const { data: existingPlayer } = await supabase
                    .from('players')
                    .select('id')
                    .ilike('name', p.name) // Case insensitive check
                    .single();

                if (existingPlayer) {
                    playerId = existingPlayer.id;
                    addLog(`Player ${p.name} exists: ${playerId}`);
                } else {
                    playerId = await addPlayer(p.name);
                    addLog(`Created player ${p.name}: ${playerId}`);
                }

                if (!playerId) continue;

                // Create Results
                for (const [date, netProfit] of Object.entries(p.dates)) {
                    const sessionId = sessionMap[date];
                    if (!sessionId) {
                        addLog(`Skipping result for ${p.name} on ${date} (No Session ID)`);
                        continue;
                    }

                    // Logic: BuyIn = 5. CashOut = 5 + NetProfit.
                    // If NetProfit is e.g. -12.5 (lost more than 5?), then implies Rebuys.
                    // For now, let's assume BuyIn increases if NetProfit < -5.
                    // Actually, simpler logic: 
                    // If NetProfit >= -5: BuyIn = 5, CashOut = 5 + NetProfit.
                    // If NetProfit < -5 (e.g. -12.5): BuyIn = 5 + (diff), CashOut = 0?
                    // Let's look at Matthew: -12.5 means he lost 12.5. If he bought in for 5, he couldn't lose 12.5 unless he rebought.
                    // So total loss = BuyIn - CashOut.
                    // If CashOut = 0 (total loss), then BuyIn = 12.5.

                    let buyIn = 5;
                    let cashOut = 5 + netProfit;

                    if (cashOut < 0) {
                        // Means they lost more than the initial 5.
                        // So CashOut should be 0 (or whatever remains), and BuyIn increases.
                        // Assuming they lost EVERYTHING (CashOut = 0), then BuyIn must satisfy: 0 - BuyIn = NetProfit.
                        // => BuyIn = -NetProfit.
                        cashOut = 0;
                        buyIn = -netProfit;
                    }

                    // Check existing result
                    const { data: existingResult } = await supabase
                        .from('results')
                        .select('id')
                        .eq('session_id', sessionId)
                        .eq('player_id', playerId)
                        .single();

                    if (!existingResult) {
                        const { error } = await supabase.from('results').insert({
                            session_id: sessionId,
                            player_id: playerId,
                            buy_in: buyIn,
                            cash_out: cashOut
                        });
                        if (error) addLog(`Error adding result for ${p.name}: ${error.message}`);
                        else addLog(`Added result for ${p.name} on ${date}: ${buyIn} in, ${cashOut} out`);
                    } else {
                        addLog(`Result already exists for ${p.name} on ${date}`);
                    }
                }
            }

            addLog('Import Complete!');
        } catch (e: any) {
            addLog(`CRITICAL ERROR: ${e.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Admin Data Import</h1>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 mb-4">
                    This will import historical data from the Google Sheet.
                    <br />
                    Sessions: 27/01, 02/02, 09/02
                </p>
                <button
                    onClick={runImport}
                    disabled={isRunning}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                >
                    {isRunning ? 'Importing...' : 'Run Import'}
                </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs h-96 overflow-y-auto border border-slate-800">
                {status.map((line, i) => (
                    <div key={i} className="text-slate-300">{line}</div>
                ))}
            </div>
        </div>
    );
};
