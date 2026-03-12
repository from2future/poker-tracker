import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const AuthGuard = () => {
    const activeRoomId = useAuthStore((state) => state.activeRoomId);

    if (!activeRoomId) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
