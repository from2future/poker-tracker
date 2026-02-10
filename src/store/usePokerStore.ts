import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Player, Session, SessionPlayerResult } from '../types';

interface PokerState {
    players: Player[];
    sessions: Session[];
    results: SessionPlayerResult[];
    isLoading: boolean;
    error: string | null;

    fetchInitialData: () => Promise<void>;

    addPlayer: (name: string) => Promise<string | null>;
    removePlayer: (id: string) => Promise<void>;
    updatePlayer: (id: string, name: string) => Promise<void>;

    addSession: (date: string, location: string, notes?: string) => Promise<string | null>;
    updateSession: (id: string, data: Partial<Omit<Session, 'id' | 'createdAt'>>) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;

    setResult: (result: SessionPlayerResult) => Promise<void>;
    getSessionResults: (sessionId: string) => SessionPlayerResult[];
}

export const usePokerStore = create<PokerState>((set, get) => ({
    players: [],
    sessions: [],
    results: [],
    isLoading: false,
    error: null,

    fetchInitialData: async () => {
        set({ isLoading: true, error: null });
        try {
            const [playersRes, sessionsRes, resultsRes] = await Promise.all([
                supabase.from('players').select('*').order('created_at', { ascending: true }),
                supabase.from('sessions').select('*').order('date', { ascending: false }),
                supabase.from('results').select('*')
            ]);

            if (playersRes.error) throw playersRes.error;
            if (sessionsRes.error) throw sessionsRes.error;
            if (resultsRes.error) throw resultsRes.error;

            // Map DB snake_case to App camelCase
            const mappedPlayers = (playersRes.data || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                createdAt: p.created_at, // critical fix
            }));

            const mappedSessions = (sessionsRes.data || []).map((s: any) => ({
                id: s.id,
                date: s.date,
                location: s.location,
                notes: s.notes,
                createdAt: s.created_at,
            }));

            const mappedResults = (resultsRes.data || []).map((r: any) => ({
                sessionId: r.session_id,
                playerId: r.player_id,
                buyIn: r.buy_in,
                cashOut: r.cash_out,
                createdAt: r.created_at,
            }));

            set({
                players: mappedPlayers,
                sessions: mappedSessions,
                results: mappedResults,
            });
        } catch (err: any) {
            console.error('Error fetching data:', err);
            set({ error: err.message });
        } finally {
            set({ isLoading: false });
        }
    },

    addPlayer: async (name) => {
        try {
            const { data, error } = await supabase
                .from('players')
                .insert([{ name }])
                .select()
                .single();

            if (error) throw error;

            set((state) => ({ players: [...state.players, data] }));
            return data.id;
        } catch (err: any) {
            set({ error: err.message });
            return null;
        }
    },

    removePlayer: async (id) => {
        try {
            const { error } = await supabase.from('players').delete().eq('id', id);
            if (error) throw error;
            set((state) => ({ players: state.players.filter((p) => p.id !== id) }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    updatePlayer: async (id, name) => {
        try {
            const { error } = await supabase.from('players').update({ name }).eq('id', id);
            if (error) throw error;
            set((state) => ({
                players: state.players.map((p) => (p.id === id ? { ...p, name } : p)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    addSession: async (date, location, notes) => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .insert([{ date, location, notes }])
                .select()
                .single();

            if (error) throw error;

            set((state) => ({ sessions: [data, ...state.sessions] }));
            return data.id;
        } catch (err: any) {
            set({ error: err.message });
            return null;
        }
    },

    updateSession: async (id, data) => {
        try {
            const { error } = await supabase.from('sessions').update(data).eq('id', id);
            if (error) throw error;
            set((state) => ({
                sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...data } : s)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    deleteSession: async (id) => {
        try {
            const { error } = await supabase.from('sessions').delete().eq('id', id);
            if (error) throw error;

            set((state) => ({
                sessions: state.sessions.filter((s) => s.id !== id),
                results: state.results.filter((r) => r.sessionId !== id),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    setResult: async (result) => {
        // Optimistic update locally first for speed? 
        // For now, let's just do direct DB calls for simplicity and reliability.
        try {
            // Check if exists
            const existing = get().results.find(
                r => r.sessionId === result.sessionId && r.playerId === result.playerId
            );

            let error;

            if (existing) {
                ({ error } = await supabase
                    .from('results')
                    .update({ buy_in: result.buyIn, cash_out: result.cashOut })
                    .eq('session_id', result.sessionId)
                    .eq('player_id', result.playerId)
                    .select()
                    .single());
            } else {
                ({ error } = await supabase
                    .from('results')
                    .insert([{
                        session_id: result.sessionId,
                        player_id: result.playerId,
                        buy_in: result.buyIn,
                        cash_out: result.cashOut
                    }])
                    .select()
                    .single());
            }

            if (error) throw error;

            // Normalize back from DB columns (snake_case) to app types (camelCase)
            // Actually, we should probably update our Types to match DB or use a mapper.
            // For speed, I'll map it manually here.
            // Wait, supabase returns data in the shape of the table.

            // To avoid complex re-fetching, let's just update local state with the input result
            // assuming success. Or better, fetch the updated row.

            // Re-fetch results for this session to be safe
            const { data: sessionResults, error: fetchError } = await supabase
                .from('results')
                .select('*')
                .eq('session_id', result.sessionId);

            if (fetchError) throw fetchError;

            // Map back to our CamelCase types
            const mappedResults: SessionPlayerResult[] = sessionResults.map((r: any) => ({
                sessionId: r.session_id,
                playerId: r.player_id,
                buyIn: r.buy_in,
                cashOut: r.cash_out
            }));

            set(state => ({
                results: [
                    ...state.results.filter(r => r.sessionId !== result.sessionId),
                    ...mappedResults
                ]
            }));

        } catch (err: any) {
            set({ error: err.message });
        }
    },

    getSessionResults: (sessionId) => {
        return get().results.filter((r) => r.sessionId === sessionId);
    },
}));
