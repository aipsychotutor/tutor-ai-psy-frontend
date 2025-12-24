import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Shield, User as UserIcon, LogOut } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // FIX: Typo 'handleClickOutsidet' sudah diperbaiki di sini
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  if (!user) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-md w-full fixed top-0 left-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              AppSkenario
            </span>
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  const userRole = user.is_admin === true ? "Admin" : "User";

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md w-full fixed top-0 left-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold dark:text-blue-400">
              CommuLab
            </span>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg focus:outline-none"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <div className="h-8 w-8 rounded-full bg-ungu text-white flex items-center justify-center font-semibold">
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

            {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1" role="menu">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
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
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}