"use client"
import { useState, useEffect, useRef } from "react"
import { Search, User, MoreVertical, LogOut, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.js";
import { getUsersAndMessages } from "../graphql/gqlFunctions.js";
import { useChatStore } from "../store/chat.js";

const Sidebar = () => {
  const navigate = useNavigate()

  const { onlineUsers, token, logout } = useAuthStore();
  const { users, setUsers, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages, updateUnseenMessages, darkMode, toggleTheme } = useChatStore();

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

  useEffect(() => {
    updateUnseenMessages(selectedUser?.id)
  }, [selectedUser]);

  useEffect(() => {
    getUsers();
  }, [onlineUsers, token]);

  const [input, setInput] = useState(false);
  const filteredUsers = input ? users?.filter((user) =>
    user.name.toLowerCase().startsWith(input.toLowerCase())
  ) : users;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const onLogout = () => {
    logout();
    navigate("/auth");
  };

  // dynamic styles based on darkMode
  const rootBg = darkMode ? "bg-gray-900 border-gray-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900";
  const headerBg = darkMode ? "bg-gray-900" : "bg-slate-50";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const searchBg = darkMode ? "bg-gray-800 text-slate-300" : "bg-slate-100 text-slate-700";
  const dropdownBg = darkMode ? "bg-gray-800 border-gray-700 text-slate-200" : "bg-white border-slate-200 text-slate-700";
  const userHover = darkMode ? "hover:bg-gray-800" : "hover:bg-slate-50";
  const selectedUserClass = darkMode ? "bg-indigo-900/20 border-indigo-700" : "bg-indigo-50 border-indigo-200";
  const unseenBadgeBorder = darkMode ? "border-gray-900" : "border-white";

  return (
    <div
      className={`${rootBg} h-full flex flex-col overflow-hidden ${selectedUser ? "max-md:hidden" : ""} border-r`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? "border-gray-800" : "border-slate-200"} ${headerBg}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{/* color inherited from root text color */}Messages</h1>

          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg transition-colors"
            >
              <MoreVertical size={18} className={`${darkMode ? "text-slate-300" : "text-slate-600"}`} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${dropdownBg}`}>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:opacity-90 transition-colors"
                >
                  <User size={18} />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    toggleTheme();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:opacity-90 transition-colors"
                >
                  {darkMode ? <Sun /> : <Moon />}
                  <span>{darkMode ? " Light Mode" : "Dark Mode"}</span>
                </button>

                <div className={`border-t ${darkMode ? "border-gray-700" : "border-slate-100"}`}></div>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Search */}
        <div className={`${searchBg} rounded-lg flex items-center gap-2 py-2 px-3`}>
          <Search size={16} className={`${darkMode ? "text-slate-400" : "text-slate-400"}`} />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className={`bg-transparent border-none outline-none text-sm placeholder-slate-400 flex-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredUsers.map((user, index) => (
          <div
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => {
                const updated = { ...prev };
                updated[user.id] = 0;
                return updated;
              });
            }}
            key={user.id || index}
            className={`flex items-center gap-3 p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all ${selectedUser?.id === user.id
              ? selectedUserClass
              : userHover
              }`}
          >
            <div className="relative flex-shrink-0">
              {user?.profile?.profileImage ? (
                <img
                  src={user.profile.profileImage}
                  className="w-12 h-12 rounded-full object-cover"
                  alt={`${user.name}'s profile`}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white">
                  <User size={20} />
                </div>
              )}

              {unseenMessages[user.id] > 0 && (
                <div className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold ${unseenBadgeBorder}`}>
                  {unseenMessages[user.id]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                {user.name}
              </p>
              <p className={`text-xs ${onlineUsers.includes(user.id)
                ? "text-green-400"
                : (darkMode ? "text-slate-400" : "text-slate-500")
                }`}>
                {onlineUsers.includes(user.id) ? "● Online" : "Offline"}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Sidebar
