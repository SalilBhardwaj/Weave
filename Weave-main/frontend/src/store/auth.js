import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { connectSocket } from '../utils/socket';
import { useChatStore } from './chat';

const authStore = (set, get) => ({
    user: null,
    token: null,
    profile: null,
    isAuthenticated: false,
    socket: null,
    onlineUsers: [],

    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setProfile: (profile) => set({ profile }),
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    setSocket: (socket) => set({ socket }),
    setOnlineUsers: (onlineUsers) => set({ onlineUsers }),

    login: (user, token) => {
        connectSocket(user);
        set({ user, token, isAuthenticated: true })
    },
    logout: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
        }
        useChatStore.getState().setSelectedUser(null);
        useChatStore.getState().setUsers([]);
        set({
            user: null,
            token: null,
            profile: null,
            isAuthenticated: false,
            socket: null,
            onlineUsers: [],
        });
        localStorage.clear();
    }
})

export const useAuthStore = create(
    persist(
        authStore,
        {
            name: 'auth-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                profile: state.profile,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
