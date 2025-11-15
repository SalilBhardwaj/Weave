import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera, Save, X } from "lucide-react";
import { useAuthStore } from "../store/auth";
import { getMyProfile, updateProfile, updateProfileImage } from "../graphql/gqlFunctions";
import { uploadImage } from "../utils/uploadImage";
import { toast } from "react-toastify";
import { useChatStore } from "../store/chat";

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // Get from store
  const { user, profile, setProfile, logout } = useAuthStore();
  const { darkMode } = useChatStore();

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Only for editing (temporary)
  const [editBio, setEditBio] = useState("");

  // Load profile once
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyProfile();
        const p = data?.getProfile;

        if (p) {
          setProfile({
            bio: p.bio || "",
            profileImage: p.profileImage || "",
            lastSeen: p.lastSeen || null,
          });
        }
      } catch (e) {
        console.error("Load error:", e);
      }
    };
    load();
  }, [setProfile]);

  const onEdit = () => {
    setEditBio(profile?.bio || "");
    setIsEditing(true);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile(user?.name || "", editBio.trim());

      setProfile({
        ...profile,
        bio: editBio.trim(),
      });

      setIsEditing(false);
      toast.success("Profile updated");
    } catch (e) {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setEditBio(profile?.bio || "");
    setIsEditing(false);
  };

  const onPickImage = () => fileRef.current?.click();

  const onImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, "profile");
      const updatedProfile = await updateProfileImage(url);

      setProfile(updatedProfile);

      toast.success("Profile picture updated");
    } catch (e) {
      // toast.error("Upload failed");
      console.log(e, e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-slate-200" : "bg-gray-50 text-slate-900"}`}>
      {/* Header */}
      <div className={darkMode ? "bg-gray-900 border-b border-gray-800" : "bg-white border-b"}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className={`px-3 py-2 rounded ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          >
            ← Back
          </button>
          <h1 className={`text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>Profile</h1>
          <button
            onClick={onLogout}
            className={`px-3 py-2 rounded ${darkMode ? "text-red-400 hover:bg-red-800" : "text-red-600 hover:bg-red-50"}`}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className={`rounded-lg p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border"}`}>
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={user?.name || "User"}
                  className={`w-28 h-28 rounded-full object-cover ${darkMode ? "border-4 border-gray-800" : "border-4 border-gray-100"}`}
                />
              ) : (
                <div className={`w-28 h-28 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center ${darkMode ? "border-4 border-gray-800" : "border-4 border-gray-100"}`}>
                  <User className={`w-12 h-12 ${darkMode ? "text-slate-200" : "text-gray-400"}`} />
                </div>
              )}

              <button
                onClick={onPickImage}
                disabled={uploading}
                className={`${darkMode ? "absolute bottom-0 right-0 p-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50" : "absolute bottom-0 right-0 p-2 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"} rounded-full`}
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </div>

            <div className="mt-4 text-center">
              <div className={`text-xl font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{user?.name || "—"}</div>
              <div className={`${darkMode ? "text-slate-400" : "text-slate-500"}`}>{user?.email || ""}</div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-8 space-y-4">
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Name</label>
              <div className={`px-3 py-2 rounded ${darkMode ? "bg-gray-700 text-slate-100" : "bg-slate-50"}`}>{user?.name || "—"}</div>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Email</label>
              <div className={`px-3 py-2 rounded ${darkMode ? "bg-gray-700 text-slate-300" : "bg-slate-50 text-slate-500"}`}>{user?.email || "—"}</div>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Bio</label>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-gray-700 text-slate-100 border-gray-700" : "bg-white text-slate-900 border-slate-200"}`}
                  placeholder="Write something about yourself"
                />
              ) : (
                <div className={`px-3 py-2 rounded min-h-[80px] ${darkMode ? "bg-gray-700 text-slate-200" : "bg-slate-50"}`}>
                  {profile?.bio || "No bio added"}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {isEditing ? (
                <>
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded ${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50" : "bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"}`}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={onCancel}
                    disabled={saving}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded ${darkMode ? "hover:bg-gray-800 border-gray-700" : "hover:bg-slate-50"}`}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={onEdit}
                  className={`w-full px-4 py-2 rounded ${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                  Edit Bio
                </button>
              )}
            </div>
          </div>

          {/* Last Seen */}
          {profile?.lastSeen && (
            <div className={`mt-6 text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Last seen: {new Date(profile.lastSeen).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
