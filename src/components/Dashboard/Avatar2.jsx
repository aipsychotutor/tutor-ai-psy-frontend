import React from 'react';

/**
 * Avatar2 Component
 *
 * Komponen reusable untuk menampilkan gambar profil (avatar) pengguna.
 * Menangani placeholder gambar default jika sumber (src) tidak tersedia atau gagal dimuat.
 * Mendukung kustomisasi ukuran melalui prop 'size'.
 *
 * @param {object} props - Properti yang diterima oleh komponen.
 * @param {string} props.src - URL sumber gambar avatar. Jika null atau gagal, akan menggunakan "/images/default.png".
 * @param {string} [props.alt=""] - Teks alternatif untuk aksesibilitas (accessibility).
 * @param {("sm"|"md"|"lg")} [props.size="md"] - Ukuran avatar. Pilihan: "sm" (kecil, 32x32px), "md" (sedang, 40x40px), "lg" (besar, 48x48px).
 * @param {string} [props.className=""] - Kelas CSS tambahan untuk styling kustom.
 */
export default function Avatar2({ src, alt = "", size = "md", className = "" }) {
  
  // Objek pemetaan ukuran (Tailwind CSS classes) berdasarkan nilai prop 'size'.
  const sizes = {
    sm: "h-8 w-8",   // 32px
    md: "h-10 w-10", // 40px (Default)
    lg: "h-12 w-12", // 48px
  };

  return (
    <img
      // Menentukan sumber gambar. Jika 'src' kosong/null, gunakan placeholder default.
      src={src || "/images/default.png"}
      alt={alt}
      // Menggabungkan kelas ukuran, styling dasar, dan kelas kustom dari pengguna.
      className={`${sizes[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 ${className}`}
      
      // Error Handler: Jika gambar gagal dimuat (misalnya link broken), ganti sumbernya ke gambar default.
      onError={(e) => {
        e.target.src = "/images/default.png";
      }}
    />
  );
}