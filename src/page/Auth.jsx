import { Toaster, toast } from "react-hot-toast"; 
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

/**
 * Konfigurasi URL dasar untuk endpoint API Otentikasi.
 * @constant {string}
 */
const API_BASE_URL = "http://localhost:3000/api/auth";

/**
 * ============================================================================
 * MODUL OTENTIKASI (AUTH)
 * ============================================================================
 * * Komponen ini berfungsi sebagai gerbang utama akses aplikasi.
 * Menangani dua fungsi utama: Masuk (Login) dan Pendaftaran (Register).
 * * @component
 * @returns {JSX.Element} Elemen halaman otentikasi.
 * * @description
 * Alur kerja komponen:
 * 1. **Inisialisasi**: Membersihkan token/session lama di LocalStorage saat komponen dimuat.
 * 2. **State Management**: Mengelola input form (email, password, username) dan mode tampilan.
 * 3. **Interaksi API**: Mengirim request POST ke backend untuk verifikasi atau pembuatan akun.
 * 4. **Manajemen Sesi**: Menyimpan JWT Token dan data user ke LocalStorage jika login sukses.
 * 5. **Navigasi**: Mengarahkan pengguna ke Dashboard setelah otentikasi berhasil.
 */
export default function Auth() {
  
  /**
   * Effect Hook: Pembersihan Sesi.
   * Dijalankan sekali saat komponen dimount (mounted).
   * Tujuannya untuk memastikan tidak ada sisa token lama yang valid
   * saat pengguna berada di halaman login, mencegah konflik sesi.
   */
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  /** @type {[boolean, function]} State untuk menentukan mode form (Login vs Register) */
  const [isSignIn, setIsSignIn] = useState(true);
  
  /** @type {[string, function]} State untuk input email */
  const [email, setEmail] = useState('');
  
  /** @type {[string, function]} State untuk input password */
  const [password, setPassword] = useState('');
  
  /** @type {[string, function]} State untuk input username (Hanya untuk Register) */
  const [username, setUsername] = useState(''); 
  
  /** Hook navigasi untuk redirect halaman */
  const navigate = useNavigate();

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  /**
   * Mengubah mode tampilan form dan mereset field input.
   * Digunakan saat pengguna menekan tombol "Sign Up" atau "Sign In" di bawah form.
   * * @param {boolean} isSigningIn - True untuk mode Login, False untuk mode Register.
   */
  const toggleForm = (isSigningIn) => {
    setIsSignIn(isSigningIn);
    // Reset state input untuk UX yang lebih bersih
    setEmail('');
    setPassword('');
    setUsername('');
  }

  // ==========================================================================
  // HANDLERS (LOGIKA BISNIS)
  // ==========================================================================

  /**
   * Menangani proses Login (Sign In).
   * * Langkah-langkah:
   * 1. Validasi input dasar (kelengkapan field).
   * 2. Mengirim kredensial ke endpoint `/login`.
   * 3. Menangani respons sukses (Simpan Token -> Redirect).
   * 4. Menangani respons gagal (Tampilkan Error).
   */
  const handleSignIn = async () => {
    // 1. Validasi Frontend
    if (!email || !password) {
      toast.error("Email dan password harus diisi."); 
      return;
    }

    const loadingToastId = toast.loading('Mencoba masuk...');

    try {
      // 2. API Request
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      toast.dismiss(loadingToastId);

      // 3. Evaluasi Respons
      if (data.status === "ok") {
        // SUKSES: Simpan sesi
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success('Berhasil masuk! Mengarahkan ke dashboard...'); 
        
        // Redirect dengan sedikit delay untuk UX
        setTimeout(() => {
            navigate("/dashboard");
        }, 1500);
      } else {
        // GAGAL: Kredensial salah atau user tidak ditemukan
        toast.error(data.message || "Gagal masuk. Coba lagi."); 
      }
    } catch (err) {
      // ERROR JARINGAN
      toast.dismiss(loadingToastId); 
      toast.error("Terjadi kesalahan koneksi ke server.");
      console.error("Login Error:", err);
    }
  };

  /**
   * Menangani proses Pendaftaran Akun (Sign Up).
   * * Langkah-langkah:
   * 1. Validasi input dasar.
   * 2. Mengirim data registrasi ke endpoint `/register`.
   * 3. Jika sukses, alihkan tampilan ke mode Login.
   */
  const handleSignUp = async () => {
    // 1. Validasi Frontend
    if (!username || !email || !password) {
      toast.error("Username, email, dan password harus diisi."); 
      return;
    }

    const loadingToastId = toast.loading('Mendaftarkan akun...');

    try {
      // 2. API Request
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      toast.dismiss(loadingToastId); 

      // 3. Evaluasi Respons
      if (data.status === "ok") {
        // SUKSES: Arahkan user untuk login manual
        toggleForm(true); 
        toast.success("Pendaftaran berhasil! Silakan masuk.");
      } else {
        // GAGAL: Validasi backend (misal: email duplikat)
        toast.error(data.message || "Gagal mendaftar. Coba lagi.");
      }
    } catch (err) {
      // ERROR JARINGAN
      toast.dismiss(loadingToastId); 
      toast.error("Terjadi kesalahan koneksi ke server.");
      console.error("Register Error:", err);
    }
  }

  // ==========================================================================
  // RENDER UI
  // ==========================================================================
  return (
    <div className="flex h-screen">
      {/* Container Toast untuk notifikasi global */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* -----------------------------------------------------------
        PANEL KIRI: FORM AREA (Interaktif)
        -----------------------------------------------------------
      */}
      <div className="w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {/* Kondisional Rendering: Tampilkan Form Login atau Register */}
          {isSignIn ? (
            
            // === TAMPILAN LOGIN ===
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Welcome Back</h1>
              <p className="text-gray-600 mb-8">Lanjutkan sesi pelatihan Anda</p>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-6">
                {/* Input Email */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email" 
                    required
                    className="w-full text-black px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                
                {/* Input Password */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full text-black px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                
                {/* Tombol Submit Login */}
                <button type="submit" className="w-full py-3 bg-yellowCustom hover:bg-krem text-black font-medium rounded-full transition-colors">
                  Sign In
                </button>
              </form>
              
              {/* Navigasi ke Halaman Register */}
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
                {/* Input Username */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    className=" text-black w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                  />
                </div>
                
                {/* Input Email */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email" 
                    required
                    className="text-black w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                
                {/* Input Password dengan Validasi Pattern */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$"
                    title="Password harus mengandung minimal 8 karakter, setidaknya satu huruf kecil, satu huruf besar, dan satu angka."
                    className="text-black w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-ungu"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                
                {/* Tombol Submit Register */}
                <button type="submit" className="w-full py-3 bg-yellowCustom hover:bg-krem text-black font-medium rounded-full transition-colors">
                  Sign up
                </button>
              </form>
              
              {/* Navigasi Kembali ke Login */}
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

      {/* -----------------------------------------------------------
        PANEL KANAN: BRANDING AREA (Statis)
        -----------------------------------------------------------
        Area ini menampilkan identitas visual aplikasi.
      */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="text-white text-center px-12">
          <h2 className="text-5xl font-bold mb-4">CommuLab</h2>
          <p className="text-xl font-light">Belajar komunikasi, siap hadapi pasien</p>
        </div>
      </div>
    </div>
  );
}