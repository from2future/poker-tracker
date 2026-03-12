import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Player, Session, SessionPlayerResult } from '../types';
import { useAuthStore } from './useAuthStore';

// Module-level map to track debounce timers for player results
const debounceTimers = new Map<string, any>();

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
        set({ isLoading: true, error: null, players: [], sessions: [], results: [] });
        try {
            const { activeRoomId } = useAuthStore.getState();
            if (!activeRoomId) {
                set({ isLoading: false, error: "No active room to fetch data for." });
                return;
            }

            const [playersRes, sessionsRes] = await Promise.all([
                supabase.from('players').select('*').eq('room_id', activeRoomId).order('created_at', { ascending: true }),
                supabase.from('sessions').select('*').eq('room_id', activeRoomId).order('date', { ascending: false }),
            ]);

            if (playersRes.error) throw playersRes.error;
            if (sessionsRes.error) throw sessionsRes.error;

            const sessionIds = (sessionsRes.data || []).map(s => s.id);
            let resultsRes: any = { data: [] };

            if (sessionIds.length > 0) {
                const res = await supabase.from('results').select('*').in('session_id', sessionIds);
                if (res.error) throw res.error;
                resultsRes = res;
            }

            // Map DB snake_case to App camelCase
            const mappedPlayers = (playersRes.data || []).map((p: any) => ({
                id: p.id,
                roomId: p.room_id,
                name: p.name,
                createdAt: p.created_at, // critical fix
            }));

            const mappedSessions = (sessionsRes.data || []).map((s: any) => ({
                id: s.id,
                roomId: s.room_id,
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
            const { activeRoomId } = useAuthStore.getState();
            if (!activeRoomId) throw new Error("No active room");

            const { data, error } = await supabase
                .from('players')
                .insert([{ name, room_id: activeRoomId }])
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
            const { activeRoomId } = useAuthStore.getState();
            if (!activeRoomId) throw new Error("No active room");

            const { data, error } = await supabase
                .from('sessions')
                .insert([{ date, location, notes, room_id: activeRoomId }])
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
        // 1. Optimistic update locally first for absolute speed
        set(state => {
            const otherResults = state.results.filter(
                r => !(r.sessionId === result.sessionId && r.playerId === result.playerId)
            );
            return {
                results: [...otherResults, result]
            };
        });

        // 2. Debounce the DB persistence
        const timerKey = `${result.sessionId}-${result.playerId}`;
        if (debounceTimers.has(timerKey)) {
            clearTimeout(debounceTimers.get(timerKey));
        }

        const timer = setTimeout(async () => {
            debounceTimers.delete(timerKey);
            try {
                const { error } = await supabase
                    .from('results')
                    .upsert({
                        session_id: result.sessionId,
                        player_id: result.playerId,
                        buy_in: result.buyIn,
                        cash_out: result.cashOut
                    }, {
                        onConflict: 'session_id,player_id'
                    });

                if (error) throw error;
            } catch (err: any) {
                console.error('Error persisting result:', err);
                set({ error: err.message });
            }
        }, 500); // 500ms debounce

        debounceTimers.set(timerKey, timer);
    },

    getSessionResults: (sessionId) => {
        return get().results.filter((r) => r.sessionId === sessionId);
    },
}));
