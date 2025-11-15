import { io } from "socket.io-client";
import { useAuthStore } from "../store/auth";


const baseUrl = import.meta.env.VITE_BASE_URL;

export const connectSocket = (user) => {
    const { socket, setSocket, setOnlineUsers } = useAuthStore.getState();
    if (!user || socket?.connected)
        return;
    const newSocket = io(baseUrl, {
        query: {
            userId: user.id,
        },
        autoConnect: false
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
        console.log("something",userIds);
        setOnlineUsers(userIds);
    });

    return newSocket;
}