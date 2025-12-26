import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Navbar from "../components/Navbar";
import Button from "../components/Dashboard/ButtonDashboard";
import { User, Mail, Trash2, ArrowLeft } from "lucide-react"; 
import { toast, Toaster } from "react-hot-toast";
import DeleteAccountModal from "../components/ProfilePage/DeleteAccountModal";

export default function ProfilePage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || { username: "User", email: "" };
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Submit ke Backend
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    
    if (!passwordRegex.test(passwordData.newPassword)) {
      return toast.error(
        "Password baru harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka."
      );
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Konfirmasi password baru tidak cocok");
    }

    if (passwordData.newPassword.length < 8) {
      return toast.error("Password baru minimal 8 karakter");
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Password berhasil diperbarui!");
        
        console.log("Password berhasil diperbarui");
        // Reset form setelah berhasil
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(result.message || "Gagal memperbarui password");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    // PERBAIKAN DI SINI:
    // 1. Hapus 'bg-gray-100 dark:bg-gray-950'
    // 2. Gunakan 'bg-transparent' agar background body (gradient ungu) terlihat

    
    <div className="h-full w-full overflow-y-auto bg-transparent">
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{ 
          className: 'font-medium', 
          style: { borderRadius: '10px', background: '#333', color: '#fff' } 
        }}
      />

      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        isSimulation={false} 
      />

      <main className="max-w-4xl mx-auto py-10 px-4">
        
        {/* Header Page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          
          <div>
            {/* Tambahkan text-white agar tulisan kontras dengan background gelap */}
            <h1 className="text-3xl font-bold text-white">
              Profil Pengguna
            </h1>
          </div>

          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-full shadow-sm hover:bg-gray-100 transition-all font-medium text-sm w-fit"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>
        </div>

        {/* KARTU KONTEN UTAMA */}
        {/* Background kartu tetap putih/gelap agar konten terbaca jelas */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
          
          {/* HEADER DALAM */}
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center sm:flex-row sm:items-start gap-6 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center border-4 border-indigo-50 dark:border-indigo-900/30 shadow-sm">
              <User size={48} className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="text-center sm:text-left space-y-1 pt-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* Detail Akun */}
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

            {/* Ganti Password */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-gray-900 dark:text-white">Keamanan Password</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Lama</label>
                  <input type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••" 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Baru</label>
                    <input type="password" 
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••" 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Konfirmasi</label>
                    <input type="password" 
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••" 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                </div>
                <div className="pt-2">
                    <Button type="submit" variant="primary">Update Password</Button>
                </div>
              </form>
            </section>

            {/* Danger Zone */}
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