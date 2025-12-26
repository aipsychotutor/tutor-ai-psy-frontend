import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Navbar from "../components/Navbar";
import Button from "../components/Dashboard/ButtonDashboard";
import { User, Mail, Trash2, ArrowLeft } from "lucide-react"; 
import DeleteAccountModal from "../components/ProfilePage/DeleteAccountModal";

export default function ProfilePage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user")) || { username: "Jojo", email: "jojo@example.com" };

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("user");  
    navigate("/");               
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        isSimulation={false}    
      />

      <main className="max-w-4xl mx-auto py-10 px-4">
        {/* HEADER HALAMAN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Profil Pengguna
            </h1>
          </div>

          {/*Tombol Kembali */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm w-fit"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>
        </div>

        {/* KARTU KONTEN UTAMA */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
          
          {/* HEADER DALAM: Avatar & Info User */}
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center sm:flex-row sm:items-start gap-6 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center border-4 border-ungu-50 dark:border-ungu-900/30 shadow-sm">
              <User size={48} className="text-ungu dark:text-ungu-400" />
            </div>
            <div className="text-center sm:text-left space-y-1 pt-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* SECTION: Detail Akun */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-gray-900 dark:text-white">Detail Lengkap</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Username</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-700 dark:text-gray-300">
                    <User size={18} className="text-gray-400" /> 
                    <span className="font-medium">{user.username}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-700 dark:text-gray-300">
                    <Mail size={18} className="text-gray-400" /> 
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION: Ganti Password */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-gray-900 dark:text-white">Keamanan Password</h3>
              <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Lama</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-ungu focus:border-ungu outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Baru</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-ungu outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Konfirmasi</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-ungu outline-none transition-all" />
                    </div>
                </div>
                <div className="pt-2">
                    <Button variant="primary">Update Password</Button>
                </div>
              </div>
            </section>

            {/* SECTION: Danger Zone */}
            <section className="pt-6 border-t border-red-100 dark:border-red-900/30">
              <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 border border-red-100 dark:border-red-900/20">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-red-700 dark:text-red-400 font-bold text-lg">Zona Berbahaya</h4>
                  <p className="text-sm text-red-600/80 dark:text-red-400/60">Menghapus akun akan menghilangkan semua data secara permanen.</p>
                </div>
                <Button 
                  variant="ghost" 
                  className="bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors px-6 shadow-sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={18} className="mr-2" /> Hapus Akun
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <DeleteAccountModal 
        show={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
      />
    </div>
  );
}