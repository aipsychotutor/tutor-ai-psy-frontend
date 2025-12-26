import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  X,
  Save,
  User,
  Briefcase,
  Heart,
  Activity,
  FileText,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";

/**
 * ============================================================================
 * HELPER COMPONENTS (AESTHETIC INPUTS)
 * ============================================================================
 */

// Input Field Modern
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  icon: Icon,
  required,
  min,
  max,
  className = "",
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className={`block w-full ${
          Icon ? "pl-10" : "pl-4"
        } pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
      />
    </div>
  </div>
);

// Select Field Modern
const SelectField = ({ label, name, value, onChange, options, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`block w-full ${
          Icon ? "pl-10" : "pl-4"
        } pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer`}
      >
        <option value="">Pilih...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);

// Text Area Modern
const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  icon: Icon,
  required,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute top-3 left-3 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`block w-full ${
          Icon ? "pl-10" : "pl-4"
        } pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none`}
      />
    </div>
  </div>
);

/**
 * ============================================================================
 * ADD SCENARIO MODAL COMPONENT
 * ============================================================================
 */
export default function AddScenarioModal({ show, onClose, onSave, user }) {
  // State Form
  const [formData, setFormData] = useState({
    patient_name: "",
    background_story: "",
    personality_type: "Introvert",
    symptom_intensity: "",
    age: "",
    gender: "Laki-laki",
    occupation: "",
    marital_status: "Belum Menikah",
    personality_traits: ["", "", "", ""],
  });

  // --- HANDLERS ---

  // Generic Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Trait Handler
  const handleTraitChange = (index, value) => {
    setFormData((prev) => {
      const newTraits = [...prev.personality_traits];
      newTraits[index] = value;
      return { ...prev, personality_traits: newTraits };
    });
  };

  const addTraitField = () => {
    setFormData((prev) => ({
      ...prev,
      personality_traits: [...prev.personality_traits, ""],
    }));
  };

  const removeTraitField = (index) => {
    setFormData((prev) => ({
      ...prev,
      personality_traits: prev.personality_traits.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = async (is_global) => {
    // 1. Validasi
    if (!formData.patient_name || !formData.background_story) {
      toast.error("Mohon lengkapi Nama dan Latar Belakang!");
      return;
    }

    // 2. Bersihkan Traits
    const filteredTraits = formData.personality_traits.filter(
      (t) => t.trim() !== ""
    );

    // 3. Format Data
    const dataToSave = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      symptom_intensity: formData.symptom_intensity
        ? parseInt(formData.symptom_intensity)
        : null,
      personality_traits: filteredTraits.length > 0 ? filteredTraits : null,
      is_global: is_global,
    };

    const loadingToast = toast.loading("Menyimpan skenario...");

    try {
      await onSave(dataToSave);
      toast.dismiss(loadingToast);

      // Reset Form
      setFormData({
        patient_name: "",
        background_story: "",
        personality_type: "Introvert",
        symptom_intensity: "",
        age: "",
        gender: "Laki-laki",
        occupation: "",
        marital_status: "Belum Menikah",
        personality_traits: ["", "", "", ""],
      });

      onClose();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Gagal menyimpan skenario.");
    }
  };

  if (!show) return null;

  return (
    // BACKDROP
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Toaster position="top-center" reverseOrder={false} />

      {/* MODAL WINDOW */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 scale-100">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tambah Skenario
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Buat karakter pasien baru untuk simulasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {/* SECTION 1: INFO DASAR */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <User size={16} className="text-blue-500" /> Informasi Dasar
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <InputField
                    label="Nama Pasien"
                    name="patient_name"
                    value={formData.patient_name}
                    onChange={handleChange}
                    placeholder="Nama lengkap pasien"
                    required
                  />
                </div>
                <div>
                  <InputField
                    label="Usia"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="25"
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <SelectField
                  label="Jenis Kelamin"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: "Laki-laki", label: "Laki-laki" },
                    { value: "Perempuan", label: "Perempuan" },
                  ]}
                />
                <SelectField
                  label="Status Pernikahan"
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  options={[
                    { value: "Belum Kawin", label: "Belum Kawin" },
                    { value: "Kawin Tercatat", label: "Kawin Tercatat" },
                    {
                      value: "Kawin Belum Tercatat",
                      label: "Kawin Belum Tercatat",
                    },
                    {
                      value: "Cerai Hidup Tercatat",
                      label: "Cerai Hidup Tercatat",
                    },
                    { value: "Cerai Mati", label: "Cerai Mati" },
                  ]}
                />
                <InputField
                  label="Pekerjaan"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  icon={Briefcase}
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            {/* SECTION 2: PSIKOLOGIS & LATAR BELAKANG */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <Activity size={16} className="text-green-500" /> Kondisi
                Psikologis
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SelectField
                  label="Tipe Kepribadian"
                  name="personality_type"
                  value={formData.personality_type}
                  onChange={handleChange}
                  options={[
                    { value: "Introvert", label: "Introvert" },
                    { value: "Extrovert", label: "Extrovert" },
                    { value: "Ambivert", label: "Ambivert" },
                  ]}
                />
                <InputField
                  label="Intensitas Gejala (1-10)"
                  name="symptom_intensity"
                  type="number"
                  value={formData.symptom_intensity}
                  onChange={handleChange}
                  placeholder="5"
                  min="1"
                  max="10"
                />
              </div>

              <TextAreaField
                label="Latar Belakang Cerita"
                name="background_story"
                value={formData.background_story}
                onChange={handleChange}
                icon={FileText}
                rows={4}
                placeholder="Ceritakan latar belakang masalah yang dihadapi pasien ini..."
                required
              />
            </div>

            {/* SECTION 3: TRAITS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-500" /> Traits
                  Kepribadian (Opsional)
                </h3>
                <button
                  type="button"
                  onClick={addTraitField}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg transition-colors"
                >
                  <Plus size={14} /> Tambah
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.personality_traits.map((trait, index) => (
                  <div key={index} className="flex gap-2 group">
                    <input
                      type="text"
                      value={trait}
                      onChange={(e) => handleTraitChange(index, e.target.value)}
                      placeholder={`Trait #${index + 1}`}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    {formData.personality_traits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTraitField(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus trait"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            Batal
          </button>

          {user?.is_admin ? (
            <>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Save size={18} /> Simpan Global
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Save size={18} /> Simpan Admin
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Save size={18} /> Simpan Pasien
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
