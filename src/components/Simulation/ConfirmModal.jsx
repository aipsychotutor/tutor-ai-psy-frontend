import React from "react";

/**
 * ConfirmModal Component
 *
 * A modal dialog to confirm critical actions like ending a session.
 * It uses a high z-index to overlay on top of other UI elements.
 *
 * @component
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onConfirm - Callback triggered when "Yes" is clicked.
 * @param {function} props.onCancel - Callback triggered when "No" or backdrop is clicked.
 * @param {string} [props.title="Yakin mengakhiri sesi?"] - Title text for the modal.
 * @param {string} [props.message="Progres akan disimpan..."] - Body text for the modal.
 */
const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Yakin mengakhiri sesi?",
  message = "Progres akan disimpan dan kamu akan kembali ke dashboard.",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop: Dark and Blurred */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto transition-opacity"
        onClick={onCancel}
      ></div>

      {/* Modal Content: White box with black border */}
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center border-4 border-black pointer-events-auto animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-black mb-2 text-black tracking-tight">
          {title}
        </h2>
        <p className="text-gray-600 mb-8 font-medium">{message}</p>

        <div className="flex gap-4 justify-center">
          {/* Yes Button (Black filled) */}
          <button
            onClick={onConfirm}
            className="flex-1 bg-black text-white py-3 rounded-lg font-bold border-2 border-black hover:bg-gray-800 transition-all active:scale-95"
          >
            Yes
          </button>

          {/* No Button (White filled) */}
          <button
            onClick={onCancel}
            className="flex-1 bg-white text-black py-3 rounded-lg font-bold border-2 border-black hover:bg-gray-100 transition-all active:scale-95"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;