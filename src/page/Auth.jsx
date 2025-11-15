import { Toaster, toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api/auth";

export default function Auth() {
  useEffect(() => {
    console.log("Membersihkan sisa sesi di halaman Login...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const toggleForm = (isSigningIn) => {
    setIsSignIn(isSigningIn);
    setEmail("");
    setPassword("");
    setUsername("");
  };

  const handleSignIn = async () => {
    console.log("Tombol Sign In diklik!");

    if (!email || !password) {
      toast.error("Email dan password harus diisi.");
      console.log("2. Validasi frontend gagal (Field kosong).");
      return;
    }

    const loadingToastId = toast.loading("Mencoba masuk...");

    try {
      console.log("3. Mengirim request ke backend...");
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      toast.dismiss(loadingToastId);

      if (data.status === "ok") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("Sign In Success:", data.user);

        toast.success("Berhasil masuk! Mengarahkan ke dashboard...");
        setTimeout(() => {
          console.log("4. Login Sukses. Navigasi ke Dashboard (setelah jeda).");
          navigate("/dashboard");
        }, 1500);
      } else {
        console.log("4. Login Gagal. Pesan error:", data.message);
        toast.error(data.message || "Gagal masuk. Coba lagi.");
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error("Terjadi kesalahan koneksi.");
      console.error("Sign In Error:", err);
    }
  };

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      toast.error("Username, email, dan password harus diisi.");
      return;
    }

    const loadingToastId = toast.loading("Mendaftarkan akun...");

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      toast.dismiss(loadingToastId);

      if (data.status === "ok") {
        console.log("Sign Up Success:", data.user);
        toggleForm(true);
        toast.success("Pendaftaran berhasil! Silakan masuk.");
      } else {
        toast.error(data.message || "Gagal mendaftar. Coba lagi.");
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error("Terjadi kesalahan koneksi.");
      console.error("Sign Up Error:", err);
    }
  };

  return (
    <div className="flex h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Left Side - Form */}
      <div className="w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {isSignIn ? (
            // Sign In Form
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">
                Welcome back
              </h1>
              <p className="text-gray-600 mb-8">Please enter your details</p>

              {/* === FORM SIGN IN === */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignIn();
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email address
                  </label>
                  <input
                    type="email" // <-- Memicu validasi format @
                    required
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder=""
                    value={email} // Hubungkan ke state
                    onChange={(e) => setEmail(e.target.value)} // Update state
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-yellowCustom hover:bg-yellow-400 text-black font-medium rounded-full transition-colors"
                >
                  Sign In
                </button>
              </form>
              {/* === END FORM === */}

              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{" "}
                <button
                  type="button" // <-- DIPERBAIKI: Harus type="button" agar tidak submit
                  onClick={() => toggleForm(false)}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>
          ) : (
            // Sign Up Form
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Sign Up</h1>
              <p className="text-gray-600 mb-8">Please enter your details</p>

              {/* === FORM SIGN UP === */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignUp();
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
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
                    type="email" // <-- Memicu validasi format @
                    required
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-dashboardStart"
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
                    minLength={8}
                    pattern="/^(?=.[a-z])(?=.[A-Z])(?=.*[0-9])(?=.{8,})/;"
                    title="Password harus mengandung minimal 8 karakter, setidaknya satu huruf kecil, satu huruf besar, dan satu angka."
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-400 text-black font-medium rounded-full transition-colors"
                >
                  Sign up
                </button>
              </form>
              {/* === END FORM === */}

              <p className="text-center text-sm text-gray-600 mt-6">
                Have an account?{" "}
                <button
                  type="button" // <-- DIPERBAIKI: Harus type="button" agar tidak submit
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

      {/* Right Side - Branding */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="text-white text-center px-12">
          <h2 className="text-5xl font-bold mb-4">CommuLab</h2>
          <p className="text-xl font-light">
            Belajar komunikasi, siap hadapi pasien
          </p>
        </div>
      </div>
    </div>
  );
}
