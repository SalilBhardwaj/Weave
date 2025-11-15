import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import { ApolloProvider } from '@apollo/client/react';
import { client } from './graphql/gqlClient.js';

import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastContainer, Slide } from 'react-toastify';

import HomePage from "./pages/HomePage"
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css"

import { useAuthStore } from './store/auth';
import { connectSocket } from './utils/socket';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔄 Reconnecting socket after refresh...");
      connectSocket(user);
    }
  }, [isAuthenticated, user]);

  return (
    <ApolloProvider client={client} >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
      <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App;