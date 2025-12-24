import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  LogOut,
  Shield,
  User as UserIcon,
} from "lucide-react";

/**
 * Navbar Component
 *
 * Komponen navigasi utama yang terletak di bagian atas aplikasi.
 * Menangani tampilan branding aplikasi dan manajemen profil pengguna (dropdown).
 *
 * Fitur Utama:
 * 1. Responsive Layout.
 * 2. Dropdown Menu dengan logika "Click Outside" untuk menutup.
 * 3. Fallback UI (Skeleton/Loading) jika data user belum tersedia.
 * 4. Indikator Role (Admin/User).
 *
 * @param {object} props - Properti komponen.
 * @param {object|null} props.user - Objek data user yang sedang login. Harus mengandung field { username, is_admin }.
 * @param {function} props.onLogout - Fungsi callback yang dipanggil saat user mengklik tombol Logout.
 */
export default function Navbar({ user, onLogout }) {
  // State untuk mengontrol visibilitas dropdown menu profil
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ref digunakan untuk mendeteksi elemen HTML dropdown di DOM
  // Diperlukan untuk logika "klik di luar area"
  const dropdownRef = useRef(null);

  /**
   * Effect Hook: Handle Click Outside
   * Menambahkan event listener ke dokumen global untuk menutup dropdown
   * jika user mengklik area di luar komponen dropdown.
   */
  useEffect(() => {
    function handleClickOutside(event) {
      // Jika ref sudah terpasang DAN element yang diklik TIDAK berada di dalam ref dropdown...
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // ...maka tutup dropdown.
      }
    }

    // Bind event listener saat komponen dipasang (mount)
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup: Hapus event listener saat komponen dilepas (unmount) untuk mencegah memory leak
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Wrapper function untuk handle logout agar dropdown tertutup rapi sebelum logout
  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  /**
   * CONDITIONAL RENDERING: Loading / No User State
   * Jika props 'user' belum ada (null/undefined), tampilkan navbar sederhana
   * dengan skeleton loader di posisi profil.
   */
  if (!user) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-md w-full sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              AppSkenario
            </span>
            {/* Skeleton Loading Animation */}
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  // Tentukan label role untuk UI
  const userRole = user.is_admin === true ? "Admin" : "User";

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md w-full sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold dark:text-blue-400">
              CommuLab
            </span>
          </div>

          {/* User Profile Area (Dropdown Trigger) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg focus:outline-none"
              aria-haspopup="true" // Aksesibilitas: Memberitahu screen reader ada popup
              aria-expanded={isDropdownOpen}
            >
              {/* Avatar: Initial dari username */}
              <div className="h-8 w-8 rounded-full bg-ungu text-white flex items-center justify-center font-semibold">
                {user.username ? user.username.charAt(0).toUpperCase() : "?"}
              </div>
              <span className="hidden sm:inline-block font-medium">
                {user.username}
              </span>
              {/* Icon Chevron berputar saat dropdown aktif */}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Content */}
            {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                >
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
                      title={user.username}
                    >
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                      {/* Conditional Icon berdasarkan Role */}
                      {userRole === "Admin" ? (
                        <Shield size={14} className="text-green-500" />
                      ) : (
                        <UserIcon size={14} className="text-gray-500" />
                      )}
                      {userRole}
                    </p>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
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