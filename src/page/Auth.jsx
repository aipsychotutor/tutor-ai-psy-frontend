import { Toaster, toast } from "react-hot-toast"; 
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

// Konfigurasi URL dasar API Auth
const API_BASE_URL = "http://localhost:3000/api/auth";

/**
 * ============================================================================
 * AUTH COMPONENT
 * ============================================================================
 * Halaman tunggal yang menangani proses Otentikasi (Login & Register).
 * Halaman ini memiliki tampilan split-screen (Kiri: Form, Kanan: Branding).
 *
 * Fitur Utama:
 * 1. Toggle antara Mode Login dan Mode Register.
 * 2. Membersihkan sesi (Logout otomatis) saat halaman ini dibuka.
 * 3. Validasi input form standar HTML5 & validasi manual JS.
 * 4. Integrasi API backend untuk /login dan /register.
 * 5. Manajemen Token JWT di LocalStorage.
 */
export default function Auth() {
  
  // --- EFFECT: CLEAR SESSION ---
  // Berjalan sekali saat komponen di-mount.
  // Tujuannya memastikan user benar-benar "keluar" jika mengunjungi halaman login,
  // mencegah token lama tertinggal yang bisa menyebabkan konflik sesi.
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // --- STATE MANAGEMENT ---
  const [isSignIn, setIsSignIn] = useState(true); // Toggle tampilan: true = Login, false = Register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const navigate = useNavigate();

  // --- HELPER: RESET FORM ---
  // Fungsi untuk mereset input saat user berpindah dari Login ke Register atau sebaliknya
  const toggleForm = (isSigningIn) => {
    setIsSignIn(isSigningIn);
    setEmail('');
    setPassword('');
    setUsername('');
  }

  // --- HANDLER: LOGIN (SIGN IN) ---
  const handleSignIn = async () => {
    // 1. Validasi Input Dasar
    if (!email || !password) {
      toast.error("Email dan password harus diisi."); 
      return;
    }

    // Tampilkan loading spinner
    const loadingToastId = toast.loading('Mencoba masuk...');

    try {
      // 2. Kirim Request ke API Login
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      toast.dismiss(loadingToastId); // Tutup loading spinner

      // 3. Cek Response Status
      if (data.status === "ok") {
        // SUKSES: Simpan token & user info ke LocalStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success('Berhasil masuk! Mengarahkan ke dashboard...'); 
        
        // Beri jeda 1.5 detik agar user bisa membaca pesan sukses sebelum redirect
        setTimeout(() => {
            navigate("/dashboard");
        }, 1500);
      } else {
        toast.error(data.message || "Gagal masuk. Coba lagi."); 
      }
    } catch (err) {
      toast.dismiss(loadingToastId); 
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  // --- HANDLER: REGISTER (SIGN UP) ---
  const handleSignUp = async () => {
    // 1. Validasi Input Dasar
    if (!username || !email || !password) {
      toast.error("Username, email, dan password harus diisi."); 
      return;
    }

    const loadingToastId = toast.loading('Mendaftarkan akun...');

    try {
      // 2. Kirim Request ke API Register
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      toast.dismiss(loadingToastId); 

      // 3. Cek Response Status
      if (data.status === "ok") {
        // SUKSES: Pindahkan tampilan ke mode Login agar user bisa masuk manual
        toggleForm(true); 
        toast.success("Pendaftaran berhasil! Silakan masuk.");
      } else {
        // GAGAL: Tampilkan error (misal: email sudah terdaftar)
        toast.error(data.message || "Gagal mendaftar. Coba lagi.");
      }
    } catch (err) {
      toast.dismiss(loadingToastId); 
      toast.error("Terjadi kesalahan koneksi.");
      console.error("Sign Up Error:", err);
    }
  }

  // --- RENDER COMPONENT ---
  return (
    <div className="flex h-screen">
      {/* Komponen Notifikasi (Toast) Global */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* ----------------------------------------------------------- */}
      {/* BAGIAN KIRI: FORM AREA */}
      {/* ----------------------------------------------------------- */}
      <div className="w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {isSignIn ? (
            
            // === TAMPILAN LOGIN ===
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Welcome Back</h1>
              <p className="text-gray-600 mb-8">Lanjutkan sesi pelatihan Anda</p>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email" // Memicu validasi format email browser
                    required
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    placeholder=""
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    placeholder=""
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                
                <button type="submit" className="w-full py-3 bg-yellowCustom hover:bg-krem text-black font-medium rounded-full transition-colors">
                  Sign In
                </button>
              </form>
              
              {/* Tombol Ganti ke Register */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => toggleForm(false)}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>

          ) : (

            // === TAMPILAN REGISTER ===
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Sign Up</h1>
              <p className="text-gray-600 mb-8">Akses skenario pasien dan mulai praktik!</p>

              <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    placeholder=""
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email" 
                    required
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    placeholder=""
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Password
                  </label>
                  {/* Validasi Password Frontend (Regex Pattern) */}
                  <input
                    type="password"
                    required
                    minLength={8}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$"
                    title="Password harus mengandung minimal 8 karakter, setidaknya satu huruf kecil, satu huruf besar, dan satu angka."
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    placeholder=""
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                
                <button type="submit" className="w-full py-3 bg-yellowCustom hover:bg-krem text-black font-medium rounded-full transition-colors">
                  Sign up
                </button>
              </form>
              
              {/* Tombol Ganti ke Login */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => toggleForm(true)}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* BAGIAN KANAN: BRANDING AREA (Static) */}
      {/* ----------------------------------------------------------- */}
      <div className="w-1/2 flex items-center justify-center">
        {/* Background image diatur di CSS global/Tailwind config pada class container induk jika diperlukan */}
        <div className="text-white text-center px-12">
          <h2 className="text-5xl font-bold mb-4">CommuLab</h2>
          <p className="text-xl font-light">Belajar komunikasi, siap hadapi pasien</p>
        </div>
      </div>
    </div>
  );
}