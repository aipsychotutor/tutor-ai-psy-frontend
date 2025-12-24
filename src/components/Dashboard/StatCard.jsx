import React from 'react';
import { Card } from './Card'; // Pastikan Card diimpor dengan benar

/**
 * StatCard Component
 *
 * Widget statistik ringkas yang biasanya ditampilkan di bagian atas Dashboard.
 * Menampilkan ikon, judul label, dan nilai metrik utama.
 *
 * Fitur:
 * 1. Otomatis memformat angka desimal agar rapi (1 desimal).
 * 2. Memiliki state 'loading' bawaan (Skeleton UI).
 * 3. Menggunakan komponen dasar <Card /> untuk konsistensi desain.
 *
 * @param {object} props - Properti komponen.
 * @param {string} props.title - Judul statistik (misal: "Total Pasien").
 * @param {number} props.value - Nilai data yang akan ditampilkan.
 * @param {React.ReactNode} props.icon - Elemen ikon (SVG/Lucide React).
 * @param {string} props.bgColor - Kelas Tailwind untuk warna latar belakang ikon (misal: "bg-blue-100").
 * @param {string} props.iconColor - Kelas Tailwind untuk warna ikon (misal: "text-blue-600").
 * @param {boolean} [props.loading=false] - Jika true, menampilkan animasi loading skeleton.
 */
export default function StatCard({ title, value, icon, bgColor, iconColor, loading }) {
  
  /**
   * Logic Formatting Angka:
   * 1. Cek apakah value adalah angka.
   * 2. Jika angka desimal (ada sisa bagi 1), bulatkan jadi 1 angka di belakang koma (toFixed(1)).
   * 3. Jika integer (bilangan bulat), biarkan apa adanya.
   * 4. Jika bukan angka (null/undefined), tampilkan 0 sebagai fallback.
   */
  const formattedValue =
    typeof value === "number" && value % 1 !== 0
      ? value.toFixed(1)
      : typeof value === "number"
      ? value
      : 0;

  return (
    <Card className="p-4 sm:p-5">
      {/* CONDITIONAL RENDERING: Loading State */}
      {loading ? (
        // --- SKELETON LOADER UI ---
        // Tampilan abu-abu berkedip saat data sedang diambil
        <div className="h-[52px] animate-pulse">
          {/* Garis untuk Judul */}
          <div className="w-2/4 h-4 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
          {/* Kotak untuk Angka */}
          <div className="w-1/3 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      ) : (
        // --- ACTUAL CONTENT ---
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div
              className={`flex-shrink-0 rounded-lg p-3 ${bgColor} ${iconColor}`}
            >
              {icon}
            </div>
            
            {/* Text Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formattedValue}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}