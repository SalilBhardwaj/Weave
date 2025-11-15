import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import ChatContainer from "../components/ChatContainer"
import RightSidebar from "../components/RightSidebar"

import { useAuthStore } from "../store/auth"
import { useChatStore } from "../store/chat"
import { useSocketMessages } from "../hooks/useSocketMessages"

const HomePage = () => {
  useSocketMessages();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated)
      navigate('/auth');
  }, [isAuthenticated, navigate])
  const { selectedUser, darkMode } = useChatStore();


  return (
    <div className={`${darkMode ? "bg-gray-900" : "bg-slate-100"} w-full h-screen flex overflow-hidden`}>
      {/* Sidebar */}
      <div className={`${selectedUser ? "max-md:hidden" : ""} w-full md:w-80 flex-shrink-0`}>
        <Sidebar />
      </div>

      {/* Chat Container */}
      <div className={`${!selectedUser ? "max-md:hidden" : ""} flex-1 flex flex-col h-full`}>
        <ChatContainer />
      </div>

      {/* Right Sidebar - Always hidden on mobile */}
      {selectedUser && (
        <div className="hidden md:block w-80">
          <RightSidebar />
        </div>
      )}
    </div>
  );
}

export default HomePage
