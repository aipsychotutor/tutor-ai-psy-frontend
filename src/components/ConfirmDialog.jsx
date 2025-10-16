export default function ConfirmModal({ 
  show, 
  title = "Konfirmasi", 
  message = "Apakah kamu yakin?", 
  onConfirm, 
  onCancel 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl text-center max-w-sm w-full overflow-hidden">
        {/* Title */}
        <h2 className="text-2xl font-bold py-6 text-black bg-white">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-700 text-base px-6 -mt-2 mb-4">
          {message}
        </p>

        {/* Garis pembatas di atas tombol */}
        <div className="border-t-2 border-black flex">
          <button
            onClick={onConfirm}
            className="flex-1 py-4 text-xl font-bold text-green-600 hover:bg-gray-100 transition-colors border-r-2 border-black"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-xl font-bold text-red-600 hover:bg-gray-100 transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
