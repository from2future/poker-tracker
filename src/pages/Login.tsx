import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const [isJoining, setIsJoining] = useState(true);
    const [roomName, setRoomName] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const joinRoom = useAuthStore((state) => state.joinRoom);
    const navigate = useNavigate();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Find room by name and passcode
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('name', roomName.trim())
                .eq('passcode', code)
                .single();

            if (error || !data) {
                setError('Incorrect password, please try again.');
                throw error;
            }

            joinRoom(data.id, data.name);
            navigate('/');
        } catch (err: any) {
            if (!error) setError('Incorrect Room Name or Passcode. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Check if name exists
            const { data: existing } = await supabase
                .from('rooms')
                .select('id')
                .eq('name', roomName.trim())
                .maybeSingle();

            if (existing) {
                setError('Room name already taken, please choose another.');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('rooms')
                .insert([{ name: roomName.trim(), passcode: code }])
                .select()
                .single();

            if (error || !data) {
                throw error;
            }

            joinRoom(data.id, data.name);
            navigate('/');
        } catch (err: any) {
            if (!error) setError('An error occurred while creating the room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => { setIsJoining(true); setError(''); }}
                        className={`flex-1 pb-2 font-bold ${isJoining ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 border-b-2 border-transparent'} transition-colors`}
                    >
                        Join Room
                    </button>
                    <button
                        onClick={() => { setIsJoining(false); setError(''); }}
                        className={`flex-1 pb-2 font-bold ${!isJoining ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 border-b-2 border-transparent'} transition-colors`}
                    >
                        Create Room
                    </button>
                </div>

                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto transition-all">
                        {isJoining ? <LogIn className="w-8 h-8 text-emerald-500" /> : <UserPlus className="w-8 h-8 text-emerald-500" />}
                    </div>
                    <h1 className="text-2xl font-bold text-white">{isJoining ? 'Join Existing Game' : 'Create New Game'}</h1>
                    <p className="text-slate-400">{isJoining ? 'Enter the room name and passcode.' : 'Set up a new tracking room.'}</p>
                </div>

                <form onSubmit={isJoining ? handleJoin : handleCreate} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Room Name (e.g., Friday Nights)"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
                        />
                        <input
                            type="password"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={isJoining ? "Passcode" : "Set Custom Passcode"}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 "
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !code || !roomName}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                {isJoining ? 'Enter Room' : 'Create Room'} <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
