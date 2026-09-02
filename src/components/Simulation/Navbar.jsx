import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, LogOut, Shield, User as UserIcon, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * Navbar Component
 *
 * The main navigation bar displayed at the top of the UI.
 * Handles branding, user profile dropdown, and the "End Session" action.
 *
 * @component
 * @param {object} props - Component props.
 * @param {object} props.user - The current user object containing { username, is_admin }.
 * @param {function} props.onLogout - Callback function triggered when "Logout Akun" is clicked.
 * @param {function} props.onEndSession - Callback function triggered when "Akhiri Sesi" button is clicked.
 */
const Navbar = ({ user, onLogout, onEndSession, sessionId }) => {
  const { session_id } = useParams();
  const effectiveSessionId = sessionId || session_id;
  const storageKey = effectiveSessionId
    ? `simulation_start_${effectiveSessionId}`
    : "simulation_start_current";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return Math.max(0, Math.floor((Date.now() - parseInt(stored, 10)) / 1000));
      }
    } catch (e) {}
    return 0;
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let storedStart = localStorage.getItem(storageKey);
    if (!storedStart) {
      storedStart = String(Date.now());
      localStorage.setItem(storageKey, storedStart);
    }
    const startTimestamp = parseInt(storedStart, 10);

    const updateElapsed = () => {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      setElapsedSeconds(Math.max(0, elapsed));
    };

    updateElapsed();
    const timerInterval = setInterval(updateElapsed, 1000);
    return () => clearInterval(timerInterval);
  }, [storageKey]);

  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  /**
   * Effect to handle clicking outside the dropdown to close it.
   */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogoClick = () => {
    toast.error("Sesi simulasi sedang berlangsung. Harap akhiri sesi terlebih dahulu jika ingin berpindah halaman.");
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    toast.error("Sesi simulasi sedang berlangsung. Harap akhiri sesi terlebih dahulu sebelum membuka profil.");
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    toast.error("Sesi simulasi sedang berlangsung. Harap akhiri sesi terlebih dahulu sebelum logout.");
  };

  // Render a skeleton/loading state if user data is not yet available
  if (!user) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-md w-full sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold text-blue-600">CommuLab</span>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  const userRole = user.is_admin === true ? "Admin" : "User";

  return (
    <nav className="bg-white shadow-md w-full pointer-events-auto sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={handleLogoClick}>
            <span className="text-2xl font-bold text-gray-800">CommuLab</span>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Live Session Timer */}
            <div className="flex items-center gap-2 border border-gray-200 px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-900 select-none">
              <Clock size={16} className="text-gray-700" />
              <span className="font-mono tracking-wider font-bold text-gray-900">
                {formatDuration(elapsedSeconds)}
              </span>
            </div>

            {/* End Session Button */}
            <button
              onClick={onEndSession}
              className="hidden sm:flex items-center gap-2 text-red-600 hover:text-white border border-red-200 hover:bg-red-600 hover:border-red-600 px-4 py-2 rounded-lg font-semibold transition-all text-sm"
              title="End the current chat session"
            >
              <LogOut size={18} />
              <span>Akhiri Sesi</span>
            </button>

            {/* User Profile Dropdown */}
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
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        {userRole === "Admin" ? (
                          <Shield size={14} className="text-green-500" />
                        ) : (
                          <UserIcon size={14} className="text-gray-500" />
                        )}
                        {userRole}
                      </p>
                    </div>

                    <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-amber-800 text-xs flex items-center gap-2">
                      <AlertCircle size={14} className="text-amber-600 shrink-0" />
                      <span>Sesi aktif. Akhiri sesi untuk berpindah halaman.</span>
                    </div>

                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserIcon size={16} /> <span>Lihat Profil</span>
                    </button>

                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
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