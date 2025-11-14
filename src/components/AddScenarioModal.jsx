// ./src/components/AddScenarioModel.jsx

import { useState, useEffect } from "react";
import Button from "../components/Button";

export default function AddScenarioModal({ show, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    patient_name: "",
    background_story: "",
    personality_type: "",
    symptom_intensity: "",
    age: "",
    gender: "",
    occupation: "",
    marital_status: "",
    personality_traits: ["", "", "", ""],
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTraitChange = (index, value) => {
    setFormData((prev) => {
      const newTraits = [...prev.personality_traits];
      newTraits[index] = value;
      return {
        ...prev,
        personality_traits: newTraits,
      };
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

  const handleSubmit = ({ is_global = false }) => {
    console.log("Submitting form data:", formData, "is_global:", is_global);
    if (!formData.patient_name || !formData.background_story) {
      alert(
        "Mohon lengkapi semua field yang wajib diisi (Nama dan Latar Belakang)"
      );
      return;
    }

    const filteredTraits = formData.personality_traits.filter(
      (trait) => trait.trim() !== ""
    );

    const dataToSave = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      symptom_intensity: formData.symptom_intensity
        ? parseInt(formData.symptom_intensity)
        : null,
      personality_traits: filteredTraits.length > 0 ? filteredTraits : null,
      is_global: is_global,
    };

    onSave(dataToSave);

    setFormData({
      patient_name: "",
      background_story: "",
      personality_type: "",
      symptom_intensity: "",
      age: "",
      gender: "",
      occupation: "",
      marital_status: "",
      personality_traits: ["", "", "", ""],
    });

    onClose();
  };

  const handleCancel = () => {
    setFormData({
      patient_name: "",
      background_story: "",
      personality_type: "",
      symptom_intensity: "",
      age: "",
      gender: "",
      occupation: "",
      marital_status: "",
      personality_traits: ["", "", "", ""],
    });
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show) {
        handleCancel();
      }
    };

    if (show) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [show]);

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

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 sm:px-0"
      onClick={handleCancel}
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      <div className="absolute inset-0 bg-gray-500/75 dark:bg-gray-900/75 backdrop-blur-sm" />

      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full sm:w-[95%] sm:max-w-3xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideIn 0.3s ease-out" }}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Tambah Skenario Pasien Baru
          </h2>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="px-6 py-4 space-y-5">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Informasi Dasar
              </h3>

              <div className="space-y-2">
                <label
                  htmlFor="patient-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nama Pasien<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="patient-name"
                  type="text"
                  value={formData.patient_name}
                  onChange={(e) => handleChange("patient_name", e.target.value)}
                  placeholder="Nama lengkap pasien"
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="age"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Usia
                  </label>
                  <input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="25"
                    min="1"
                    max="120"
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Jenis Kelamin
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  >
                    <option value="">Pilih...</option>
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="marital-status"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Status Pernikahan
                  </label>
                  <select
                    id="marital-status"
                    value={formData.marital_status}
                    onChange={(e) =>
                      handleChange("marital_status", e.target.value)
                    }
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  >
                    <option value="">Pilih...</option>
                    {maritalStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="occupation"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Pekerjaan
                </label>
                <input
                  id="occupation"
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleChange("occupation", e.target.value)}
                  placeholder="Contoh: Software Engineer"
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>
            </div>

            {/* Background Story */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Latar Belakang & Kondisi
              </h3>

              <div className="space-y-2">
                <label
                  htmlFor="background-story"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Latar Belakang Cerita
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="background-story"
                  value={formData.background_story}
                  onChange={(e) =>
                    handleChange("background_story", e.target.value)
                  }
                  placeholder="Jelaskan latar belakang pasien, riwayat kehidupan, dan konteks yang relevan dengan kondisi saat ini..."
                  rows={5}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="personality-type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Tipe Kepribadian
                  </label>
                  <select
                    id="personality-type"
                    value={formData.personality_type}
                    onChange={(e) =>
                      handleChange("personality_type", e.target.value)
                    }
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  >
                    <option value="">Pilih...</option>
                    {personalityTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="symptom-intensity"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Intensitas Gejala (1-10)
                  </label>
                  <input
                    id="symptom-intensity"
                    type="number"
                    value={formData.symptom_intensity}
                    onChange={(e) =>
                      handleChange("symptom_intensity", e.target.value)
                    }
                    placeholder="5"
                    min="1"
                    max="10"
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>

            {/* Personality Traits */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Traits Kepribadian - Opsional
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={addTraitField}
                  className="text-indigo-600 dark:text-indigo-400"
                >
                  + Tambah Trait
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tambahkan deskripsi karakter dan sifat kepribadian pasien
              </p>

              <div className="space-y-3">
                {formData.personality_traits.map((trait, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={trait}
                      onChange={(e) => handleTraitChange(index, e.target.value)}
                      placeholder={`Contoh: ${
                        index === 0
                          ? "Kreatif dan detail-oriented"
                          : index === 1
                          ? "Perfeksionis, sulit mendelegasikan tugas"
                          : index === 2
                          ? "Emosional, sangat terikat dengan hasil karyanya"
                          : "Ramah ke pelanggan, tapi tertutup pada orang terdekat"
                      }`}
                      className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    {formData.personality_traits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTraitField(index)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        aria-label="Hapus trait"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Batal
          </Button>
          {user.is_admin ? (
            <>
              <Button
                type="button"
                variant="primary"
                onClick={() => handleSubmit({ is_global: true })}
              >
                Simpan Pasien Ke Global
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => handleSubmit({ is_global: false })}
              >
                Simpan Pasien Hanya di Admin
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={() => handleSubmit({ is_global: false })}
            >
              Simpan Pasien
            </Button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(1rem) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
