import React, { useState, createContext, useContext, useEffect } from "react";
import { LOGIN, SIGNUP } from '../graphql/gqlMutation.js';
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;

    const parse = (v) => {
        try {
            return v ? JSON.parse(v) : null;
        } catch {
            return null;
        }
    };

    const initialUser = parse(localStorage.getItem('user'));
    const initialToken = localStorage.getItem('token');

    const [user, setUser] = useState(initialUser);
    const [isAuthenticated, setIsAuthenticated] = useState(!!(initialUser && initialToken));
    const [token, setToken] = useState(initialToken);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setonlineUsers] = useState([]);

    const [logingql] = useMutation(LOGIN);
    const [signupgql] = useMutation(SIGNUP);

    useEffect(() => {

        const u = parse(localStorage.getItem('user'));
        const t = localStorage.getItem('token');
        if (u && t) {
            setUser(u);
            setToken(t);
            connectSocket(u);
            setIsAuthenticated(true);
        } else {
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        }
    }, []);

    const connectSocket = (user) => {
        if (!user || socket?.connected)
            return;
        const newSocket = io(baseUrl, {
            query: {
                userId: user.id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);
        newSocket.on("getOnlineUsers", (userIds) => {
            setonlineUsers(userIds);
        });
    };

    const login = async (email, password) => {
        const { data } = await logingql({ variables: { email, password } });
        if (data.login?.success) {
            const { user, token } = data.login;
            setUser(user);
            setToken(token);
            setIsAuthenticated(true);
            connectSocket(user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            toast.success("Login Successful");
            return { success: true, message: 'Login Successful' };
        } else {
            const { success, message } = data.login;
            toast.error("Login Failed");
            return { success, message };
        }
    };

    const signup = async (name, email, password) => {
        const { data } = await signupgql({ variables: { name, email, password } });
        if (data.signup?.success) {
            const { success, message } = data.signup;
            toast.success(message);
            return { success, message };
        } else {
            const { success, message } = data.signup;
            toast.error(message);
            return { success, message };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setonlineUsers([]);
        if (socket) { 
            socket.disconnect();
        }
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return;
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            token,
            socket,
            onlineUsers,
            login,
            signup,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
