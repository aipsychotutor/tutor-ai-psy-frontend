import React from "react";
import Button from "../Dashboard/ButtonDashboard";
import { AlertTriangle, X } from "lucide-react";

/**
 * DeleteAccountModal Component
 * Menampilkan konfirmasi destruktif untuk penghapusan akun.
 */
export default function DeleteAccountModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop dengan Blur Kuat */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 transform animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Warning Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-500">
            <AlertTriangle size={40} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hapus Akun Anda?
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Tindakan ini tidak dapat dibatalkan. Anda akan kehilangan akses ke seluruh skenario buatan sendiri dan laporan riwayat sesi.
            </p>
          </div>

          <div className="flex flex-col w-full gap-3">
            <Button 
              variant="primary" 
              className="bg-red-600 hover:bg-red-700 text-white border-none py-3"
              onClick={() => {
                console.log("Delete account triggered");
                onClose();
              }}
            >
              Ya, Hapus Akun Saya
            </Button>
            <Button 
              variant="secondary" 
              className="py-3"
              onClick={onClose}
            >
              Batal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}