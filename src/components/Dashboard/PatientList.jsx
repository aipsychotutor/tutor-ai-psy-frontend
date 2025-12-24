import React from 'react';
import Button from "./ButtonDashboard"; 
import Avatar2 from "./Avatar2"; 
import { formatTraits } from "../../utils/formatters"; 

/**
 * SessionPatientListItem Component
 * * Komponen presentational yang merender SATU baris data pasien.
 * Biasanya digunakan di dalam list riwayat sesi atau daftar antrian.
 * * @param {object} props - Properti komponen.
 * @param {object} props.patient - Objek data pasien (harus memiliki field: id, name, image).
 * @param {function} props.onDetailClick - Callback saat tombol "Detail" diklik.
 * @param {function} props.onReportClick - Callback saat tombol "Laporan" diklik.
 */
export function SessionPatientListItem({ patient, onDetailClick, onReportClick }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-950 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      
      {/* Kolom Kiri: Avatar & Nama */}
      <div className="flex items-center gap-3">
        <Avatar2 src={patient.image} alt="" />
        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
          {patient.name}
        </span>
      </div>

      {/* Kolom Kanan: Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onDetailClick(patient)}
          aria-label={`Lihat detail ${patient.name}`}
        >
          Detail
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onReportClick(patient)}
          aria-label={`Lihat laporan ${patient.name}`}
        >
          Laporan
        </Button>
      </div>
    </div>
  );
}

/**
 * SessionPatientList Component
 * * Container (Wrapper) untuk menampilkan daftar pasien dalam format LIST VERTIKAL.
 * Memiliki fungsi scroll internal jika konten melebihi ketinggian maksimum.
 * * @param {object} props
 * @param {Array} props.patients - Array data pasien.
 * @param {function} props.onDetailClick - Diteruskan ke SessionPatientListItem.
 * @param {function} props.onReportClick - Diteruskan ke SessionPatientListItem.
 */
export function SessionPatientList({ patients, onDetailClick, onReportClick }) {
  return (
    // 'space-y-px' memberikan jarak tipis antar item list
    // 'max-h-[300px] overflow-y-auto' membuat list bisa di-scroll tanpa memanjangkan halaman
    <div className="space-y-px overflow-y-auto max-h-[300px] rounded-lg">
      {patients.map((patient) => (
        <SessionPatientListItem
          key={patient.id}
          patient={patient}
          onDetailClick={onDetailClick}
          onReportClick={onReportClick}
        />
      ))}
    </div>
  );
}

/**
 * PatientList (Default Export)
 * * Komponen utama untuk menampilkan "Pustaka Skenario" dalam format GRID KARTU.
 * Berbeda dengan SessionPatientList, komponen ini lebih visual dan detail (ada tag, traits, dll).
 * * @param {object} props
 * @param {Array} props.patients - Array data pasien/skenario.
 * @param {function} props.onStartSession - Callback saat user ingin memulai simulasi dengan pasien ini.
 */
export default function PatientList({ patients, onStartSession }) {
  
  // --- EMPTY STATE HANDLING ---
  // Tampilkan pesan ramah jika hasil pencarian/filter kosong
  if (!patients || patients.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Tidak ada skenario yang cocok. <br />
        Coba ubah filter atau kata kunci pencarian Anda.
      </div>
    );
  }

  return (
    // Grid System Responsif:
    // Mobile: 1 kolom | Tablet: 2 kolom | Desktop: 3 kolom | Large Desktop: 4 kolom
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2 max-h-[300px] overflow-y-auto pr-1">
      {patients.map((pasien) => (
        <div
          key={pasien.id}
          className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02]"
        >
          {/* Bagian Atas Card (Konten Info) */}
          <div className="p-4 flex-grow">
            {/* Header: Avatar & Nama */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar2 src={pasien.image} alt={pasien.name} size="md" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {pasien.name}
              </h3>
            </div>

            {/* Tag Kategori (Warna dinamis dari backend/props) */}
            <div className="mb-2">
              <span
                className={`inline-block ${pasien.patient_tag_color} text-xs font-semibold px-2.5 py-0.5 rounded-full`}
              >
                {pasien.patient_tag}
              </span>
            </div>

            {/* Deskripsi Traits */}
            {/* 'line-clamp-2' memotong teks jika lebih dari 2 baris agar kartu tetap rapi */}
            <p className="text-xs text-gray-600 dark:text-gray-400 h-10 line-clamp-2">
              {formatTraits(pasien.personality_traits)}
            </p>
          </div>

          {/* Bagian Bawah Card (Action Button) */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStartSession?.(pasien)}
              className="w-full"
            >
              Mulai Sesi
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}