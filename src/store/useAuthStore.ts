import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    activeRoomId: string | null;
    activeRoomName: string | null;
    joinRoom: (id: string, name: string) => void;
    leaveRoom: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            activeRoomId: null,
            activeRoomName: null,
            joinRoom: (id, name) => set({ activeRoomId: id, activeRoomName: name }),
            leaveRoom: () => set({ activeRoomId: null, activeRoomName: null }),
        }),
        {
            name: 'poker-auth-storage',
            // We only want to persist session state if the user doesn't close the tab? 
            // Actually consistent login is better for PWA feel.
        }
    )
);
