import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Users, History, LayoutDashboard, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/useAuthStore';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            clsx(
                'flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors',
                isActive
                    ? 'text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
            )
        }
    >
        <Icon className="w-6 h-6 mb-1" />
        <span className="hidden sm:inline">{label}</span>
    </NavLink>
);

export const Layout = () => {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (confirm('Logout of private session?')) {
            logout();
            navigate('/login');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 sm:pb-4">
                <div className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl p-4">
                    {/* Header for Mobile */}
                    <div className="mb-6 mt-2 flex items-center justify-between">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            Poker Tracker
                        </h1>
                        <button onClick={handleLogout} className="text-emerald-500/80 hover:text-emerald-400 p-2">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation for Mobile / Sidebar for Desktop (simplified to bottom for now as it's mobile first) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 safe-area-pb">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto sm:max-w-2xl md:max-w-4xl">
                    <NavLink to="/" className={({ isActive }) => clsx('flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors', isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200')}>
                        <LayoutDashboard className="w-6 h-6 mb-1" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </NavLink>
                    <NavLink to="/sessions" className={({ isActive }) => clsx('flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors', isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200')}>
                        <History className="w-6 h-6 mb-1" />
                        <span className="hidden sm:inline">Sessions</span>
                    </NavLink>
                    <NavLink to="/players" className={({ isActive }) => clsx('flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors', isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200')}>
                        <Users className="w-6 h-6 mb-1" />
                        <span className="hidden sm:inline">Players</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};
