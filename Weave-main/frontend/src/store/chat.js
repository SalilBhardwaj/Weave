import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const chatStore = (set) => ({
    messages: [],
    users: [],
    selectedUser: null,
    unseenMessages: {},
    darkMode: false,

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    setMessages: (messages) => set({
        messages: [...messages].sort((a, b) =>  // ✅ Spread creates a copy
            new Date(a.createdAt) - new Date(b.createdAt)
        )
    }),
    updateMessage: (tempId, serverMessage) => set((state) => ({
        messages: state.messages.map(msg =>
            msg.id === tempId ? { ...serverMessage } : msg
        )
    })),
    removeMessage: (id) => set((state) => ({
        messages: state.messages.filter(msg => msg.id !== id)
    })),
    setUsers: (users) => set({ users }),
    setSelectedUser: (selectedUser) => set({ selectedUser }),
    setUnseenMessages: (message) => set((state) => ({
        unseenMessages: {
            ...state.unseenMessages,
            [message.senderId]: (state.unseenMessages[message.senderId] || 0) + 1
        }
    })),
    toggleTheme: () => set((state) => ({
        darkMode: !state.darkMode
    })),
    updateUnseenMessages: (userId) => set((state) => ({
        unseenMessages: {
            ...state.unseenMessages,
            [userId]: 0
        }
    })),
});

export const useChatStore = create(
    persist(
        chatStore,
        {
            name: 'chat-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                selectedUser: state.selectedUser,
                darkMode: state.darkMode,
                users: state.users
            }),
        }
    )
);