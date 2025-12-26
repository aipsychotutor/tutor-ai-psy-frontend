import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Trash2, Play, User, FileText, Activity, Calendar, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * ============================================================================
 * COMPONENT 1: PATIENT LIST (PUSTAKA SKENARIO) - DEFAULT EXPORT
 * ============================================================================
 * Menampilkan daftar skenario dengan proteksi RBAC (Satpam).
 */
export default function PatientList({ 
  patients, 
  onStartSession, 
  onEditScenario, 
  onDeleteScenario, 
  user 
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGIC SATPAM (RBAC CHECK) ---
  const handleMenuClick = (e, patient) => {
    e.stopPropagation();

    const isGlobalScenario = patient.patient_tag === "Global";
    const isAdmin = user?.is_admin === true;

    if (isGlobalScenario && !isAdmin) {
      toast.error("Akses Ditolak: Anda tidak dapat mengubah Skenario Global!", {
        icon: "🔒",
        style: {
          borderRadius: '12px',
          background: '#1f2937',
          color: '#fff',
          fontWeight: 'bold',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      });
      return; 
    }

    setOpenMenuId(openMenuId === patient.id ? null : patient.id);
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <User className="text-gray-400" size={40} />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Tidak ada skenario ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="group relative bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-visible"
          onClick={() => onStartSession(patient)}
        >
          {/* Header Card */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 overflow-hidden shadow-inner">
                  <img
                    src={patient.image || "/images/default.png"}
                    alt={patient.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = "/images/default.png"; }}
                  />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${patient.patient_tag === "Global" ? "bg-blue-500" : "bg-green-500"}`}></div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {patient.name}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide mt-1 ${patient.patient_tag_color}`}>
                  {patient.patient_tag}
                </span>
              </div>
            </div>

            {/* Tombol Titik 3 */}
            <div className="relative">
              <button
                onClick={(e) => handleMenuClick(e, patient)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-90"
              >
                <MoreVertical size={20} />
              </button>

              {/* Dropdown Menu */}
              {openMenuId === patient.id && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-1.5 space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        onEditScenario(patient);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 rounded-xl transition-colors"
                    >
                      <Edit size={16} /> Edit Skenario
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        onDeleteScenario(patient);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} /> Hapus Permanen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {patient.background_story || "Tidak ada deskripsi latar belakang."}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex -space-x-2 overflow-hidden">
               {patient.personality_traits && patient.personality_traits.length > 0 ? (
                 patient.personality_traits.slice(0, 3).map((trait, i) => (
                   <div key={i} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-gray-800 text-[10px] text-indigo-700 dark:text-indigo-300 font-bold" title={trait}>
                     {trait.charAt(0).toUpperCase()}
                   </div>
                 ))
               ) : (
                 <span className="text-xs text-gray-400 italic">No traits</span>
               )}
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
              <Play size={12} fill="currentColor" /> Mulai
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ============================================================================
 * COMPONENT 2: SESSION PATIENT LIST (RIWAYAT SESI) - NAMED EXPORT
 * ============================================================================
 * Menampilkan daftar riwayat sesi latihan (untuk bagian bawah dashboard).
 * UPDATE: Tombol Detail & Laporan sekarang ada tulisannya biar jelas!
 */
export const SessionPatientList = ({ patients, onDetailClick, onReportClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {patients.map((patient, index) => {
        const dateObj = new Date(patient.lastSession);
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
        const formattedTime = dateObj.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit"
        });

        return (
          <div
            key={index}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300"
          >
            {/* Header Sesi */}
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg border border-indigo-100 dark:border-indigo-800">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white truncate">{patient.name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <Calendar size={12} />
                  <span>{formattedDate}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <Clock size={12} />
                  <span>{formattedTime}</span>
                </div>
              </div>
            </div>

            {/* Status & Action Buttons */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 h-10">
              
              {/* Badge Status (Kiri) - Hilang pas di-hover biar gak sempit */}
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-opacity duration-200 group-hover:opacity-0 group-hover:hidden ${
                patient.status === 'completed' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {patient.status === 'completed' ? 'Selesai' : 'Berlangsung'}
              </span>
              
              {/* Action Buttons (Kanan/Full) - Muncul pas di-hover */}
              <div className="flex gap-2 w-full justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hidden group-hover:flex">
                <button
                  onClick={() => onDetailClick(patient)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <User size={14} />
                  Detail
                </button>
                <button
                  onClick={() => onReportClick(patient)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                >
                  <FileText size={14} />
                  Laporan
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};