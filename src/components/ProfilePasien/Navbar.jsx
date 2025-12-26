import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, Shield, User as UserIcon } from "lucide-react";

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
const Navbar = ({ user, onLogout, onEndSession }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
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
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-gray-800">CommuLab</span>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-4">
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
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold shadow-sm">
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
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
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

                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} />
                      <span>Logout Akun</span>
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