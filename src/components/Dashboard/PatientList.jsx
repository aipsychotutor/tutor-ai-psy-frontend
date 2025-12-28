import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast"; // Pastikan ini diimport buat alert
import Button from "./ButtonDashboard";
import Avatar2 from "./Avatar2";
import { formatTraits } from "../../utils/formatters";

/**
 * ============================================================================
 * MODULE: PatientList.jsx
 * ============================================================================
 * File ini berisi kumpulan komponen untuk menampilkan daftar pasien/skenario.
 * Terdiri dari:
 * 1. SessionPatientListItem: Item baris tunggal untuk riwayat sesi.
 * 2. SessionPatientList: Container list untuk riwayat sesi.
 * 3. PatientList (Default): Tampilan Grid utama Pustaka Skenario dengan fitur manajemen (Edit/Delete).
 */

/**
 * ============================================================================
 * SUB-COMPONENT: SessionPatientListItem
 * ============================================================================
 * Komponen presentasional yang merender satu baris data pasien dalam konteks riwayat sesi.
 * * @component
 * @param {object} props - Properti komponen
 * @param {object} props.patient - Data object pasien (id, name, image, dll)
 * @param {function} props.onDetailClick - Callback saat tombol "Detail" diklik
 * @param {function} props.onReportClick - Callback saat tombol "Laporan" diklik
 */
export function SessionPatientListItem({
  patient,
  onDetailClick,
  onReportClick,
}) {
  // ========== SYMPTOM INTENSITY CATEGORIZATION ==========
  const symptomIntensity = parseInt(patient.symptom_intensity) || 0;
  let symptom_intensity_tag = "";
  let symptom_intensity_tag_color = "";

  if (symptomIntensity <= 3) {
    symptom_intensity_tag = "Mild";
    symptom_intensity_tag_color = "bg-green-100 text-green-800";
  } else if (symptomIntensity <= 6) {
    symptom_intensity_tag = "Moderate";
    symptom_intensity_tag_color = "bg-yellow-100 text-yellow-800";
  } else if (symptomIntensity <= 8) {
    symptom_intensity_tag = "Mod-Severe";
    symptom_intensity_tag_color = "bg-orange-100 text-orange-800";
  } else {
    symptom_intensity_tag = "Severe";
    symptom_intensity_tag_color = "bg-red-100 text-red-800";
  }
  // ===============================================
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-950 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      {/* --- KOLOM KIRI: Identitas Pasien (Avatar & Nama) --- */}
      <div className="flex items-center gap-3">
        <Avatar2 src={patient.image} alt="" />
        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
          {patient.name}
        </span>
        <span
          className={`inline-block ${symptom_intensity_tag_color} text-xs font-semibold px-2.5 py-0.5 rounded-full`}
        >
          {symptom_intensity_tag}
        </span>
      </div>

      {/* --- KOLOM KANAN: Tombol Aksi (Detail & Laporan) --- */}
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
 * ============================================================================
 * SUB-COMPONENT: SessionPatientList
 * ============================================================================
 * Container wrapper untuk menampilkan daftar SessionPatientListItem.
 * Memiliki properti scroll overflow jika list terlalu panjang.
 * * @component
 * @param {object} props
 * @param {Array} props.patients - Array data pasien riwayat sesi
 * @param {function} props.onDetailClick - Diteruskan ke child component
 * @param {function} props.onReportClick - Diteruskan ke child component
 */
export function SessionPatientList({ patients, onDetailClick, onReportClick }) {
  return (
    // 'overflow-y-auto' & 'max-h-[300px]' memastikan list bisa discroll di area terbatas
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
 * ============================================================================
 * MAIN COMPONENT: PatientList (Default Export)
 * ============================================================================
 * Komponen utama untuk menampilkan "Pustaka Skenario" dalam format GRID KARTU.
 * Dilengkapi dengan fitur "Kebab Menu" (Titik Tiga) untuk aksi Edit & Delete.
 * * @component
 * @param {object} props
 * @param {Array} props.patients - Array data seluruh pasien/skenario yang tersedia
 * @param {function} props.onStartSession - Callback saat user ingin memulai chat
 * @param {function} props.onEditScenario - Callback membuka modal Edit (diterima dari Dashboard)
 * @param {function} props.onDeleteScenario - Callback konfirmasi Hapus (diterima dari Dashboard)
 * @param {object} props.user - Data user yang sedang login (UNTUK CEK ROLE) -> WAJIB ADA
 */
export default function PatientList({
  patients,
  onStartSession,
  onEditScenario,
  onDeleteScenario,
  user,
}) {
  // --- STATE MANAGEMENT ---
  // Menyimpan ID pasien yang menu dropdown-nya sedang aktif/terbuka.
  // Jika null, berarti tidak ada menu yang terbuka.
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  /**
   * --- HANDLER: Toggle Dropdown (DENGAN SATPAM 👮‍♂️) ---
   * Mengatur buka/tutup menu titik tiga.
   * @param {object} pasien - Object data pasien (Bukan cuma ID, biar bisa cek tag)
   * @param {Event} e - Event object browser
   */
  const toggleDropdown = (pasien, e) => {
    e.stopPropagation(); // PENTING: Mencegah trigger event klik pada parent card (jika ada)

    // --- LOGIC SATPAM: CEK AKSES ---
    // 1. Cek apakah ini skenario Global? (Biasanya ditandai string 'Global' di patient_tag)
    //    Sesuaikan logic ini dengan data backend kamu kalau beda field.
    const isGlobalScenario = pasien.patient_tag === "Global";

    // 2. Cek apakah user adalah Admin?
    const isAdmin = user?.is_admin === true;

    // 3. Jika Global DAN Bukan Admin => BLOKIR!
    if (isGlobalScenario && !isAdmin) {
      toast.error(
        "AKSES DITOLAK: Anda tidak dapat mengubah atau menghapus Skenario Global!",
        {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }
      );
      return; // Stop disini, menu gak bakal kebuka
    }

    // Kalau lolos satpam, lanjut buka/tutup menu
    const id = pasien.id;
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  /**
   * --- EFFECT: Click Outside Listener ---
   * Menutup dropdown otomatis jika user mengklik area lain di luar menu.
   */
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);

    // Pasang event listener pada window
    document.addEventListener("click", handleClickOutside);

    // Cleanup event listener saat komponen unmount
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /**
   * --- HANDLER: Edit Click ---
   * Dipanggil saat user memilih opsi "Update Pasien" dari dropdown.
   */
  const handleEditClick = (patient, e) => {
    e.stopPropagation(); // Cegah bubbling event
    setActiveDropdownId(null); // Tutup menu dropdown segera
    if (onEditScenario) {
      onEditScenario(patient); // Eksekusi fungsi dari parent
    }
  };

  /**
   * --- HANDLER: Delete Click ---
   * Dipanggil saat user memilih opsi "Delete Skenario" dari dropdown.
   */
  const handleDeleteClick = (patient, e) => {
    e.stopPropagation(); // Cegah bubbling event
    setActiveDropdownId(null); // Tutup menu dropdown segera
    if (onDeleteScenario) {
      onDeleteScenario(patient); // Eksekusi fungsi dari parent
    }
  };

  // --- RENDER: EMPTY STATE ---
  // Tampilkan pesan jika data pasien kosong (misal: hasil search nihil)
  if (!patients || patients.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Tidak ada skenario yang cocok. <br />
        Coba ubah filter atau kata kunci pencarian Anda.
      </div>
    );
  }

  // --- RENDER: GRID LIST ---
  return (
    // Layout Grid Responsif: 1 kolom (Mobile) -> 4 kolom (Large Desktop)
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2 max-h-[300px] overflow-y-auto pr-1">
      {patients.map((pasien) => (
        <div
          key={pasien.id}
          // 'relative': Diperlukan sebagai anchor posisi absolute menu dropdown
          // 'overflow-visible': Agar dropdown menu bisa muncul keluar batas kartu (pop-out)
          className="relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-visible transition-transform hover:scale-[1.02]"
        >
          {/* ============================================================== */}
          {/* BAGIAN 1: MENU OPSI (KEBAB MENU / TITIK TIGA) */}
          {/* ============================================================== */}
          <div className="absolute top-3 right-3 z-10">
            {/* Tombol Trigger (Titik Tiga) */}
            <button
              // UPDATE: Sekarang kirim object 'pasien' utuh, bukan cuma ID
              onClick={(e) => toggleDropdown(pasien, e)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
              aria-label="Opsi lainnya"
            >
              {/* SVG Icon: Ellipsis Vertical */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                />
              </svg>
            </button>

            {/* Panel Dropdown (Hanya muncul jika activeDropdownId == ID pasien ini) */}
            {activeDropdownId === pasien.id && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                <div className="py-1">
                  {/* Opsi 1: Update */}
                  <button
                    onClick={(e) => handleEditClick(pasien, e)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    Update Pasien
                  </button>

                  {/* Opsi 2: Delete (Warna Merah) */}
                  <button
                    onClick={(e) => handleDeleteClick(pasien, e)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Delete Skenario
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* BAGIAN 2: KONTEN KARTU UTAMA */}
          {/* ============================================================== */}
          <div className="p-4 flex-grow pt-8">
            {" "}
            {/* Padding-top besar agar teks tidak tertabrak tombol menu */}
            {/* Header: Avatar & Nama */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar2 src={pasien.image} alt={pasien.name} size="md" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">
                {pasien.name}
              </h3>
            </div>
            {/* Badge/Tag Kategori */}
            <div className="flex gap-2 mb-2">
              <span
                className={`inline-block ${pasien.patient_tag_color} text-xs font-semibold px-2.5 py-0.5 rounded-full`}
              >
                {pasien.patient_tag}
              </span>
              <span
                className={`inline-block ${pasien.symptom_intensity_tag_color} text-xs font-semibold px-2.5 py-0.5 rounded-full`}
              >
                {pasien.symptom_intensity_tag}
              </span>
            </div>
            {/* Deskripsi Traits (Dibatasi 2 baris) */}
            <p className="text-xs text-gray-600 dark:text-gray-400 h-10 line-clamp-2">
              {formatTraits(pasien.personality_traits)}
            </p>
          </div>

          {/* ============================================================== */}
          {/* BAGIAN 3: TOMBOL AKSI UTAMA (MULAI SESI) */}
          {/* ============================================================== */}
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
