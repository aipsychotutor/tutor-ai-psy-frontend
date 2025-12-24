import React from 'react';

/**
 * Card Component
 *
 * Komponen kontainer (wrapper) utama yang digunakan untuk membungkus konten di dalam Dashboard.
 * Komponen ini memiliki gaya visual yang konsisten (sudut membulat, shadow, background)
 * dan mendukung sistem Grid responsif.
 *
 * @param {object} props - Properti komponen.
 * @param {React.ReactNode} props.children - Isi konten yang akan ditampilkan di dalam kartu.
 * @param {string} [props.className=""] - Class CSS tambahan untuk kustomisasi (misal: padding khusus).
 * @param {(1|2|3)} [props.span=1] - Menentukan lebar kolom kartu pada layar besar (Desktop/LG).
 * - 1: Lebar standar (1 kolom).
 * - 2: Lebar ganda (2 kolom).
 * - 3: Lebar penuh/triple (3 kolom).
 */
export function Card({ children, className = "", span = 1 }) {
  
  // LOGIKA GRID SPAN:
  // Mengatur kelas Tailwind 'col-span' berdasarkan props 'span'.
  // Logika ini hanya aktif pada breakpoint 'lg' (Large Screens) ke atas.
  // Pada layar mobile/tablet, kartu akan otomatis menumpuk (stack) secara default.
  const spanClass =
    span === 2 ? "lg:col-span-2" : span === 3 ? "lg:col-span-3" : "";

  return (
    <div
      className={`
        rounded-[2.5rem]                 /* Sudut sangat membulat (khas desain modern/Apple-like) */
        bg-cardBackgroundColor           /* Menggunakan variabel warna custom dari tailwind.config.js */
        dark:bg-cardBackgroundColorDark  /* Warna background khusus mode gelap */
        backdrop-blur                    /* Efek 'Frosted Glass' (blur background di belakang kartu) */
        shadow-lg                        /* Memberikan kedalaman (depth) */
        p-4                              /* Padding default internal */
        ${spanClass}                     /* Kelas dinamis untuk lebar kolom */
        ${className}                     /* Kelas tambahan dari parent component */
      `}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader Component
 *
 * Komponen header standar untuk Card.
 * Berfungsi untuk menampilkan Judul Kartu dan Aksi Opsional (seperti tombol menu/edit)
 * dengan tata letak yang rapi (kiri-kanan).
 *
 * @param {object} props
 * @param {string} props.title - Teks judul kartu.
 * @param {React.ReactNode} [props.action] - Elemen opsional di sebelah kanan (misal: Icon Button).
 */
export function CardHeader({ title, action }) {
  return (
    // Flexbox dengan 'justify-between' akan mendorong Title ke kiri dan Action ke kanan mentok.
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      
      {/* Area Action: Biasanya diisi dengan tombol titik tiga (...) atau tombol 'Lihat Semua' */}
      {action}
    </div>
  );
}