import { useEffect, useState } from "react"
import { User, LogOut, Mail, Phone } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuthStore } from "../store/auth"
import { useChatStore } from "../store/chat"

const RightSidebar = () => {
  const { logout, isAuthenticated, onlineUsers } = useAuthStore();
  const { selectedUser, messages, darkMode } = useChatStore();
  const navigate = useNavigate();
  const [images, setImages] = useState([])
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);

    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  // Output: "03/11/2025, 04:30 PM"


  const handleLogout = () => {
    logout()
    navigate('/auth');
  }
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Login to Continue.');
      navigate('/auth');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let images = [];
    messages.forEach((message) => {
      if (message.image)
        images.push(message.image);
    });
    setImages(images);
  }, [messages]);

  return (
    selectedUser && (
      <div className={`${darkMode ? "bg-gray-900 text-slate-200 border-gray-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-l w-full relative min-h-screen overflow-y-auto flex flex-col max-md:hidden`}>
        {/* Profile Section */}
        <div className={`pt-8 pb-6 px-6 flex flex-col items-center gap-4 ${darkMode ? "border-b border-gray-800" : "border-b border-slate-200"}`}>
          {selectedUser ? (
            selectedUser?.profile?.profileImage ? (
              <img
                src={selectedUser.profile.profileImage || "/placeholder.svg"}
                alt=""
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className={`w-20 h-20 rounded-full ${darkMode ? "bg-gray-700" : "bg-gradient-to-br from-indigo-400 to-indigo-600"} flex items-center justify-center text-white`}>
                <User size={32} />
              </div>
            )
          ) : null}

          <div className="text-center">
            <h1 className={`${darkMode ? "text-slate-100" : "text-slate-900"} text-lg font-semibold`}>{selectedUser?.name ?? "—"}</h1>
            <p className={`text-s mt-1 ${onlineUsers?.includes(selectedUser.id) ? 'text-green-400' : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
              {onlineUsers?.includes(selectedUser.id) ? "● Active now" : `Offline`}
            </p>
            <p>
              {onlineUsers?.includes(selectedUser.id) ? "" : `last seen ${selectedUser.profile?.lastSeen ? formatTime(selectedUser.profile.lastSeen) : ""}`}
            </p>
          </div>
          <p className={`${darkMode ? "text-slate-400" : "text-slate-600"} text-sm text-center`}>{selectedUser?.profile?.bio ?? "No bio added"}</p>
        </div>

        {/* Contact Info */}
        {/* <div className="px-6 py-4 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Contact</p>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-slate-700">
              <Mail size={18} className="text-indigo-600" />
              <span className="text-sm">Send Email</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-slate-700">
              <Phone size={18} className="text-indigo-600" />
              <span className="text-sm">Call</span>
            </button>
          </div>
        </div> */}

        {/* Media Section */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <p className={`text-xs font-semibold ${darkMode ? "text-slate-300" : "text-slate-500"} uppercase tracking-wide mb-3`}>Media</p>
          <div className="grid grid-cols-2 gap-3">
            {images.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url)}
                className={`cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity ${darkMode ? "ring-1 ring-gray-800" : ""}`}
              >
                <img src={`${url}?w=400&auto=format`} alt="" className="w-full h-24 object-cover" />
              </div>
            ))}
            {images.length === 0 && (
              <div className={`col-span-2 py-6 text-center ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                No media yet
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className={`px-6 py-4 ${darkMode ? "border-t border-gray-800" : "border-t border-slate-200"}`}>
          <button
            onClick={handleLogout}
            className={`w-full ${darkMode ? "bg-gradient-to-r from-indigo-700 to-indigo-500 hover:from-indigo-600 hover:to-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"} text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors`}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    )
  )
}

export default RightSidebar
