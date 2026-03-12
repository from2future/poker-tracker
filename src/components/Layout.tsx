import { NavLink, Outlet } from 'react-router-dom';
import { Users, History, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/useAuthStore';

// NavItem removed as it is no longer used

export const Layout = () => {
    const leaveRoom = useAuthStore((state) => state.leaveRoom);
    const activeRoomName = useAuthStore((state) => state.activeRoomName);

    const handleLogout = () => {
        // Native confirm dialogs can block state updates and cause glitches/hangs in React router.
        leaveRoom();
        // AuthGuard handles the redirect automatically.
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 sm:pb-4">
                <div className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl p-4">
                    {/* Header for Mobile */}
                    <div className="mb-6 mt-2">
                        <div className="flex justify-center gap-4 text-emerald-500/60 mb-2 text-xs">
                            <span className="suit-float" style={{ animationDelay: '0s' }}>♠️</span>
                            <span className="suit-float" style={{ animationDelay: '0.1s' }}>♥️</span>
                            <span className="suit-float" style={{ animationDelay: '0.2s' }}>♣️</span>
                            <span className="suit-float" style={{ animationDelay: '0.3s' }}>♦️</span>
                        </div>
                        <div className="flex items-center justify-between border-b-2 border-dashed border-slate-800 pb-4">
                            <h1 className="text-2xl font-bold text-emerald-500 tracking-tighter truncate pr-4">
                                {activeRoomName ? activeRoomName.toUpperCase() : 'POKER ROOM'}
                            </h1>
                            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 font-mono text-xs whitespace-nowrap">
                                [LEAVE]
                            </button>
                        </div>
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
