import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, LogOut, Shield, User as UserIcon, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

// isSimulation (Default false), sessionId
const Navbar = ({ user, onLogout, onEndSession, isSimulation = false, sessionId }) => {
  const { session_id } = useParams();
  const effectiveSessionId = sessionId || session_id;
  const storageKey = effectiveSessionId
    ? `simulation_start_${effectiveSessionId}`
    : "simulation_start_current";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (!isSimulation) return 0;
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

  // Timer simulasi: sinkron dengan timestamp mulai, tahan refresh / reload
  useEffect(() => {
    if (!isSimulation) return;

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
  }, [isSimulation, storageKey]);

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
    if (isSimulation) {
      toast.error("Sesi simulasi sedang berlangsung. Harap akhiri sesi terlebih dahulu jika ingin berpindah halaman.");
      return;
    }
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    if (isSimulation) {
      toast.error("Sesi simulasi sedang berlangsung. Harap akhiri sesi terlebih dahulu sebelum membuka profil.");
      return;
    }
    navigate("/profile-user");
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    if (isSimulation) {
      toast.error("Sesi simulasi sedang berlangsung. Harap akhiri sesi terlebih dahulu sebelum logout.");
      return;
    }
    onLogout();
  };

  if (!user) return null;

  const userRole = user.is_admin === true ? "Admin" : "User";

  return (
    <nav className="bg-white shadow-md w-full pointer-events-auto sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 cursor-pointer" onClick={handleLogoClick}>
            <span className="text-2xl font-bold text-ungu">CommuLab</span>
          </div>

          <div className="flex items-center gap-3">
            {isSimulation && (
              <>
                {/* Live Session Timer */}
                <div className="flex items-center gap-2 border border-gray-200 px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-900 select-none">
                  <Clock size={16} className="text-gray-700" />
                  <span className="font-mono tracking-wider font-bold text-gray-900">
                    {formatDuration(elapsedSeconds)}
                  </span>
                </div>

                {/* Tombol Akhiri Sesi */}
                <button
                  onClick={onEndSession}
                  className="hidden sm:flex items-center gap-2 text-red-600 hover:text-white border border-red-200 hover:bg-red-600 hover:border-red-600 px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                  title="End the current chat session"
                >
                  <LogOut size={18} />
                  <span>Akhiri Sesi</span>
                </button>
              </>
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
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                      <p className="text-xs text-gray-500">{userRole}</p>
                    </div>

                    {isSimulation && (
                      <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-amber-800 text-xs flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-600 shrink-0" />
                        <span>Sesi aktif. Akhiri sesi untuk berpindah halaman.</span>
                      </div>
                    )}

                    <button
                      onClick={handleProfileClick}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserIcon size={16} className="mr-2" /> Lihat Profil
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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