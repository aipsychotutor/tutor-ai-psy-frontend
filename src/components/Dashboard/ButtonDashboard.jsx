/**
 * ButtonDashboard Component
 *
 * Komponen tombol reusable yang dirancang khusus untuk antarmuka Dashboard.
 * Mendukung berbagai variasi gaya (variant) dan ukuran (size), serta dark mode.
 *
 * @param {object} props - Properti komponen
 * @param {React.ReactNode} props.children - Konten di dalam tombol (teks atau ikon).
 * @param {function} [props.onClick] - Fungsi yang dipanggil saat tombol diklik.
 * @param {('primary'|'secondary'|'ghost'|'link')} [props.variant='primary'] - Gaya visual tombol.
 * - 'primary': Latar belakang ungu/indigo (untuk aksi utama).
 * - 'secondary': Latar belakang abu-abu (untuk aksi sekunder/batal).
 * - 'ghost': Tanpa latar belakang, hanya teks (untuk aksi minim distraksi).
 * - 'link': Seperti tautan teks biru.
 * @param {('sm'|'md'|'lg')} [props.size='md'] - Ukuran tombol (padding & font-size).
 * @param {string} [props.className=''] - Kelas CSS tambahan (jika perlu override styling).
 * @param {object} [props...rest] - Props standar button lainnya (type, disabled, id, dll).
 */
export default function ButtonDashboard({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) {
  // 1. Base Class: Styling dasar yang selalu diterapkan (layout, tipografi, & aksesibilitas)
  // 'focus-visible' digunakan agar ring hanya muncul saat navigasi keyboard (aksesibilitas)
  const baseClass = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2';
  
  // 2. Variants: Definisi tema warna (Background, Text, Hover, & Dark Mode)
  const variants = {
    primary: 'bg-ungu text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus-visible:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus-visible:ring-gray-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus-visible:ring-indigo-500',
    link: 'text-ungu dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 focus-visible:ring-indigo-500'
  };
  
  // 3. Sizes: Pengaturan dimensi (Padding & Font Size)
  const sizes = {
    sm: 'px-2 py-1 text-xs sm:text-sm', // Kecil, cocok untuk tabel atau card padat
    md: 'px-4 py-2 text-sm',            // Standar
    lg: 'px-6 py-3 text-base'           // Besar, untuk CTA utama
  };

  return (
    <button
      onClick={onClick}
      // Menggabungkan kelas: Base + Variant terpilih + Size terpilih + Custom Class
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      // Menyebarkan sisa props (seperti 'disabled' atau 'type="submit"')
      {...props}
    >
      {children}
    </button>
  );
}