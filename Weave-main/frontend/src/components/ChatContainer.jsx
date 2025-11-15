import React, { useState, useEffect, useRef } from "react";
import { BadgeInfo, User, X, MessageSquareMore, Images, Send } from "lucide-react";
import { uploadImage } from "../utils/uploadImage";
import { useAuthStore } from "../store/auth";
import { useChatStore } from "../store/chat";
import { getMessagesForUser, sendMessages } from "../graphql/gqlFunctions";
import { toast } from "react-toastify";

const ChatContainer = () => {
  const { selectedUser, setSelectedUser, messages, setMessages, addMessage, darkMode } = useChatStore();
  const { user, onlineUsers, token, profile } = useAuthStore();


  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const getMessagesForSelectedUser = async () => {
    if (!token || !selectedUser) {
      setMessages([]);
      return;
    }
    try {
      const res = await getMessagesForUser();
      const msgs = res?.data?.getMessagesForUser || [];
      setMessages(msgs);
    } catch (e) {
      if (e?.name === "AbortError") return;
      console.error("getMessages error", e);
    }
  }

  useEffect(() => {
    getMessagesForSelectedUser();
  }, [selectedUser, token]);

  // Handle message send
  const handleSendMessage = async () => {
    setSending(true);
    if (!input.trim() && !imageFile) return;
    if (!token || !selectedUser) return;
    const message = input;
    setInput("");
    let fakeMessage;
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'message');
      }

      fakeMessage = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        receiverId: selectedUser.id,
        text: message,
        image: imageUrl,
        createdAt: Date.now()
      };
      addMessage(fakeMessage);

      const { data } = await sendMessages(message, imageUrl);
      const serverMessage = data?.sendMessages;
      if (serverMessage) {
        useChatStore.getState().updateMessage(fakeMessage.id, serverMessage);
      }
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      useChatStore.getState().removeMessage(fakeMessage.id);
    }
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  // Check if message is from selected user
  const isFromSelected = (msg) => selectedUser && msg.senderId === selectedUser.id;

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If no user selected, show empty state
  if (!selectedUser) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${darkMode ? "bg-gray-900 text-slate-200" : "bg-slate-50 text-slate-700"} h-full md:max-md:hidden`}>
        <div className={`${darkMode ? "bg-gray-800" : "bg-slate-200"} p-4 rounded-full`}>
          <MessageSquareMore size={32} className={`${darkMode ? "text-slate-200" : "text-slate-600"}`} />
        </div>
        <p className={`text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-700"}`}>Select a conversation</p>
        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Choose a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 text-slate-200" : "bg-slate-50 text-slate-800"} flex flex-col h-full w-full`}>
      {/* Header - Sticky */}
      <div className={`${darkMode ? "bg-gray-800 border-gray-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"} sticky top-0 z-10 flex items-center justify-between py-4 px-6 border-b shadow-sm`}>
        {/* Add back button for mobile */}
        <button
          onClick={() => setSelectedUser(null)}
          className={`md:hidden p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700 text-slate-200" : "hover:bg-slate-100 text-slate-600"}`}
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          {selectedUser?.profile?.profileImage ? (
            <img
              src={selectedUser.profile?.profileImage}
              className="w-10 h-10 rounded-full object-cover"
              alt={selectedUser.name}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white">
              <User size={20} />
            </div>
          )}
          <div>
            <p className={`text-sm font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{selectedUser?.name}</p>
            <p className={`text-xs ${onlineUsers.includes(selectedUser.id) ? "text-green-500" : (darkMode ? "text-slate-400" : "text-slate-500")}`}>
              {onlineUsers.includes(selectedUser.id) ? "● Active now" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700 text-slate-200" : "hover:bg-slate-100 text-slate-600"}`}
            aria-label="User info"
          >
            <BadgeInfo size={20} />
          </button>
          <button
            onClick={() => setSelectedUser(null)}
            className={`max-md:hidden p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700 text-slate-200" : "hover:bg-slate-100 text-slate-600"}`}
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide min-h-0 w-full"
      >
        <div className="flex flex-col p-6 space-y-4">
          {messages.length === 0 ? (
            <div className={`${darkMode ? "text-slate-400" : "text-slate-400"} flex items-center justify-center h-full`}>
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const fromSelected = isFromSelected(msg);
              return (
                <div
                  key={msg.id || index}
                  className={`flex items-end gap-2 ${fromSelected ? "justify-start" : "justify-end"}`}
                >
                  {/* Avatar for selected user (left) */}
                  {fromSelected && (
                    selectedUser?.profile?.profileImage ? (
                      <img
                        src={selectedUser.profile?.profileImage}
                        alt={selectedUser.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                        <User size={16} />
                      </div>
                    )
                  )}

                  {/* Message content */}
                  <div className={`flex flex-col ${fromSelected ? "items-start" : "items-end"} max-w-xs`}>
                    {msg.image ? (
                      <img
                        src={msg.image}
                        alt="attachment"
                        className={`rounded-xl shadow-md max-w-full cursor-pointer hover:opacity-90 transition-opacity ${darkMode ? "ring-1 ring-gray-700" : ""}`}
                        onClick={() => window.open(msg.image, '_blank')}
                      />
                    ) : (
                      <div
                        className={`px-4 py-2 rounded-2xl ${fromSelected
                          ? `${darkMode ? "bg-gray-800 text-slate-100 rounded-bl-none shadow-sm" : "bg-white text-slate-900 rounded-bl-none"}`
                          : `${darkMode ? "bg-indigo-600 text-white rounded-br-none" : "bg-indigo-600 text-white rounded-br-none"}`
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                    )}

                    {/* Timestamp */}
                    {msg.createdAt && (
                      <span className={`text-xs mt-1 px-1 ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    )}
                  </div>

                  {/* Avatar for current user (right) */}
                  {!fromSelected && (
                    profile?.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white flex-shrink-0">
                        <User size={16} />
                      </div>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Send Area */}
      <div className={`${darkMode ? "bg-gray-800 border-t border-gray-700" : "bg-white border-t border-slate-200"} sticky bottom-0 px-4 md:px-6 pb-4 pt-4 w-full`}>
        {imageFile && (
          <div className={`${darkMode ? "bg-gray-700" : "bg-slate-100"} mb-2 flex items-center gap-2 rounded-lg p-2`}>
            <Images size={16} className={`${darkMode ? "text-indigo-300" : "text-indigo-600"}`} />
            <span className={`text-sm ${darkMode ? "text-slate-200" : "text-slate-600"} flex-1 truncate`}>{imageFile.name}</span>
            <button
              onClick={() => {
                setImageFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className={`${darkMode ? "text-slate-300 hover:text-slate-100" : "text-slate-500 hover:text-slate-700"}`}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className={`flex items-center gap-3 rounded-full p-1 pl-4 ${darkMode ? "bg-gray-700" : "bg-slate-100"}`}>
          <input
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            type="text"
            value={input}
            placeholder="Type a message..."
            className={`flex-1 text-sm p-2 border-none rounded-full outline-none ${darkMode ? "text-slate-200 placeholder-slate-400 bg-transparent" : "text-slate-800 placeholder-slate-400 bg-transparent"}`}
          />
          <input
            ref={fileInputRef}
            type="file"
            id="image"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            hidden
            onChange={handleImageChange}
          />
          <label
            htmlFor="image"
            className={`cursor-pointer p-2 transition-colors ${darkMode ? "text-slate-200 hover:text-indigo-300" : "text-slate-600 hover:text-indigo-600"}`}
          >
            <Images size={20} />
          </label>
          <button
            onClick={handleSendMessage}
            disabled={(!input.trim() && !imageFile) || sending}
            className={`p-2 rounded-full transition-colors ${input.trim() || imageFile
              ? (darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white")
              : (darkMode ? "bg-gray-600 text-slate-300 cursor-not-allowed" : "bg-slate-300 text-slate-500 cursor-not-allowed")
              }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
