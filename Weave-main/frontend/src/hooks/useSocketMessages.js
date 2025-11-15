import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { useChatStore } from '../store/chat';
import { getUsersAndMessages } from '../graphql/gqlFunctions';

export function useSocketMessages() {
    const { socket, isAuthenticated, token } = useAuthStore();
    const { selectedUser, addMessage, setUnseenMessages, setUsers } = useChatStore();

    useEffect(() => {
        if (!socket || !isAuthenticated) return;

        const newHandler = (newMessage) => {
            console.log("💬 New message:", newMessage);

            if (selectedUser && newMessage.senderId === selectedUser.id) {
                newMessage.seen = true;
                addMessage(newMessage);
            } else {
                setUnseenMessages(newMessage);
            }
        };
        const updateHandler = ({ fakeId, message }) => {
            console.log("💬 Update message:", message);
            if (message) {
                useChatStore.getState().updateMessage(fakeId, message);
            }
        }
        const refreshUsers = () => {
            console.log("Update users");
            const getUsers = async () => {
                if (!token) return;
                try {
                    const { data } = await getUsersAndMessages();
                    console.log("getUsers response", data);

                    const usersArr = data?.getUsers || [];
                    const unseen = {};

                    for (let um of usersArr) {
                        unseen[um.id] = um.unseenMessages?.[0]?.count ?? 0;
                    }
                    setUsers(usersArr);
                    setUnseenMessages(unseen);
                } catch (e) {
                    if (e?.name === "AbortError") return;
                }
            }
            getUsers();
        }
        socket.on("newMessage", newHandler);
        socket.on("updateMessage", updateHandler);
        socket.on("refreshUsers", refreshUsers);
        return () => {
            socket.off("newMessage");
        };
    }, [socket, isAuthenticated, selectedUser?.id, addMessage, setUnseenMessages]);
}
