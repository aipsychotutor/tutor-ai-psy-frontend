import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Button from "./ButtonDashboard"; // Pastikan path import sesuai struktur foldermu

/**
 * ============================================================================
 * MODULE: EditScenarioModal.jsx
 * ============================================================================
 * Komponen Modal untuk MENGUBAH (Update) data skenario pasien yang sudah ada.
 * * Perbedaan utama dengan AddScenarioModal:
 * 1. Menerima prop 'initialData'.
 * 2. Menggunakan useEffect untuk mengisi form otomatis saat modal dibuka.
 */

/**
 * EditScenarioModal Component
 * * @component
 * @param {object} props - Properti komponen
 * @param {boolean} props.show - Mengontrol visibilitas modal (true = tampil)
 * @param {function} props.onClose - Callback untuk menutup modal
 * @param {function} props.onSave - Callback saat tombol "Update" diklik (mengirim data baru ke parent)
 * @param {object} props.initialData - Data object pasien SBLM diedit (untuk pre-fill form)
 * @param {object} props.user - Data user (untuk keperluan validasi role/admin jika ada)
 */
export default function EditScenarioModal({ show, onClose, onSave, initialData, user }) {
  
  // --- STATE MANAGEMENT ---
  // Menyimpan data form sementara sebelum disubmit.
  // Struktur state disesuaikan dengan field database.
  const [formData, setFormData] = useState({
    patient_name: "",
    background_story: "",
    personality_type: "",
    symptom_intensity: "",
    age: "",
    gender: "",
    occupation: "",
    marital_status: "",
    personality_traits: ["", "", "", ""], // Default 4 slot kosong
  });

  /**
   * --- EFFECT: POPULATE DATA (Pre-fill) ---
   * Dijalankan setiap kali modal dibuka (show=true) atau initialData berubah.
   * Tujuannya agar form tidak kosong, tapi terisi data pasien yang mau diedit.
   */
  useEffect(() => {
    if (show && initialData) {
      setFormData({
        // Mapping: pastikan key di sini sesuai dengan key di state formData
        // Operator '|| ""' mencegah error 'uncontrolled input' jika data null
        patient_name: initialData.name || "", 
        background_story: initialData.background_story || "",
        personality_type: initialData.personality_type || "",
        symptom_intensity: initialData.symptom_intensity || "",
        age: initialData.age || "",
        gender: initialData.gender || "",
        occupation: initialData.occupation || "",
        marital_status: initialData.marital_status || "",
        
        // Logika Traits: Jika ada data traits, pakai itu. Jika tidak, reset ke 4 slot kosong.
        personality_traits: initialData.personality_traits && initialData.personality_traits.length > 0 
          ? initialData.personality_traits 
          : ["", "", "", ""],
      });
    }
  }, [show, initialData]);

  // --- HANDLERS (LOGIKA FORM) ---

  /**
   * Mengupdate field text/select biasa.
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Mengupdate specific trait berdasarkan index array.
   * Diperlukan karena traits adalah array strings.
   */
  const handleTraitChange = (index, value) => {
    setFormData((prev) => {
      const newTraits = [...prev.personality_traits];
      newTraits[index] = value;
      return { ...prev, personality_traits: newTraits };
    });
  };

  /**
   * Menambah input field baru ke array traits.
   */
  const addTraitField = () => {
    setFormData((prev) => ({
      ...prev,
      personality_traits: [...prev.personality_traits, ""],
    }));
  };

  /**
   * Menghapus input field trait tertentu.
   */
  const removeTraitField = (index) => {
    setFormData((prev) => ({
      ...prev,
      personality_traits: prev.personality_traits.filter((_, i) => i !== index),
    }));
  };

  /**
   * Menangani proses submit (Update).
   */
  const handleSubmit = async () => {
    // 1. Validasi Field Wajib
    if (!formData.patient_name || !formData.background_story) {
      toast.error("Mohon lengkapi Nama dan Latar Belakang");
      return;
    }

    // 2. Simulasi Save (Debug)
    console.log("Data Updated:", formData);
    
    // 3. Eksekusi Callback Parent (Integrasi API)
    // await onSave(formData); // Uncomment baris ini jika API sudah siap
    
    // 4. Feedback UI
    toast.success("Berhasil update data pasien (Simulasi UI)");
    onClose();
  };

  // --- STATIC OPTIONS (Pilihan Dropdown) ---
  const personalityTypeOptions = [
    { value: "introvert", label: "Introvert" },
    { value: "extrovert", label: "Extrovert" },
    { value: "ambivert", label: "Ambivert" },
  ];
  const genderOptions = [
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" },
    { value: "Lainnya", label: "Lainnya" },
  ];
  const maritalStatusOptions = [
    { value: "Belum Menikah", label: "Belum Menikah" },
    { value: "Menikah", label: "Menikah" },
    { value: "Cerai", label: "Cerai" },
    { value: "Duda/Janda", label: "Duda/Janda" },
  ];

  // Early Return: Jangan render apapun jika show = false
  if (!show) return null;

  return (
    // Overlay Container (Fixed Position, Full Screen)
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 sm:px-0">
      <Toaster position="top-center" />
      
      {/* Backdrop Gelap (Blur Effect) */}
      <div 
        className="absolute inset-0 bg-gray-500/75 dark:bg-gray-900/75 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full sm:w-[95%] sm:max-w-3xl max-h-[95vh] overflow-hidden animate-[slideIn_0.3s_ease-out]">
        
        {/* === HEADER MODAL === */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Edit Skenario Pasien
          </h2>
        </div>

        {/* === BODY FORM (SCROLLABLE) === */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] px-6 py-4 space-y-5">
          
          {/* BAGIAN 1: INFORMASI DASAR */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">Informasi Dasar</h3>
            
            {/* Input Nama */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Pasien*</label>
              <input type="text" value={formData.patient_name} onChange={(e) => handleChange("patient_name", e.target.value)} className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* Grid 3 Kolom: Usia, Gender, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usia</label>
                <input type="number" value={formData.age} onChange={(e) => handleChange("age", e.target.value)} className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                <select value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                  <option value="">Pilih...</option>
                  {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select value={formData.marital_status} onChange={(e) => handleChange("marital_status", e.target.value)} className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                  <option value="">Pilih...</option>
                  {maritalStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            {/* Input Pekerjaan */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pekerjaan</label>
              <input type="text" value={formData.occupation} onChange={(e) => handleChange("occupation", e.target.value)} className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            </div>
          </div>

          {/* BAGIAN 2: LATAR BELAKANG */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">Latar Belakang & Kondisi</h3>
            
            {/* Input Story (Textarea) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latar Belakang Cerita*</label>
              <textarea rows={5} value={formData.background_story} onChange={(e) => handleChange("background_story", e.target.value)} className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
            </div>
            
            {/* Grid 2 Kolom: Tipe Personality & Intensitas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipe Kepribadian</label>
                <select value={formData.personality_type} onChange={(e) => handleChange("personality_type", e.target.value)} className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                  <option value="">Pilih...</option>
                  {personalityTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Intensitas Gejala (1-10)</label>
                <input type="number" min="1" max="10" value={formData.symptom_intensity} onChange={(e) => handleChange("symptom_intensity", e.target.value)} className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
              </div>
            </div>
          </div>

          {/* BAGIAN 3: TRAITS KEPRIBADIAN (DYNAMIC) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
               <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Traits Kepribadian</h3>
               <Button type="button" variant="ghost" size="xs" onClick={addTraitField} className="text-indigo-600">+ Tambah</Button>
            </div>
            <div className="space-y-3">
              {formData.personality_traits.map((trait, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={trait} onChange={(e) => handleTraitChange(index, e.target.value)} placeholder={`Trait ${index + 1}`} className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
                  {/* Tombol Hapus Trait (Hanya muncul jika > 1 trait) */}
                  {formData.personality_traits.length > 1 && <button type="button" onClick={() => removeTraitField(index)} className="text-red-500">✕</button>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === FOOTER ACTIONS === */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="button" variant="primary" onClick={handleSubmit}>Update Pasien</Button>
        </div>
      </div>
    </div>
  );
}