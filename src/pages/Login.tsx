import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Check against Supabase app_settings
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'access_code')
                .single();

            if (error) {
                console.error("Supabase Error:", error);
                if (error.code === 'PGRST116') {
                    setError('Setup Error: "access_code" not found in database.');
                } else {
                    setError(`Database Error: ${error.message}`);
                }
                throw error;
            }

            if (data && data.value === code) {
                login();
                navigate('/');
            } else {
                setError('Invalid access code');
            }
        } catch (err: any) {
            console.error("Login error", err);
            // Don't overwrite specific errors set above
            if (!error) {
                setError(err.message || 'Connection error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Private Game</h1>
                    <p className="text-slate-400">Enter the group access code to continue.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Access Code"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-widest text-lg"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !code}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Checking...' : (
                            <>
                                Enter Game <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
