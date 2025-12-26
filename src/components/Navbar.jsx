import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Shield, User as UserIcon } from "lucide-react";

// Perhatikan props baru: isSimulation (Default false)
const Navbar = ({ user, onLogout, onEndSession, isSimulation = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  if (!user) return null;

  const userRole = user.is_admin === true ? "Admin" : "User";

  return (
    <nav className="bg-white shadow-md w-full pointer-events-auto sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl font-bold text-ungu">CommuLab</span>
          </div>

          <div className="flex items-center gap-4">
            {isSimulation && (
              <button
                onClick={onEndSession}
                className="hidden sm:flex items-center gap-2 text-red-600 hover:text-white border border-red-200 hover:bg-red-600 hover:border-red-600 px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                title="End the current chat session"
              >
                <LogOut size={18} />
                <span>Akhiri Sesi</span>
              </button>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 p-2 rounded-lg focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-ungu text-white flex items-center justify-center font-semibold shadow-sm">
                  {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                </div>
                <span className="hidden sm:inline-block font-medium">
                  {user.username}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                      <p className="text-xs text-gray-500">{userRole}</p>
                    </div>
                    <button onClick={() => navigate("/profile-user")} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <UserIcon size={16} className="mr-2" /> Lihat Profil
                    </button>
                    <button onClick={handleLogoutClick} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      <LogOut size={16} /> <span>Logout Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;