import { useState } from 'react';

function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  ...props 
}) {
  const variants = {
    danger: 'bg-white text-red-500 hover:bg-red-50 border-2 border-white',
    success: 'bg-teal-500 text-white hover:bg-teal-600 border-2 border-teal-500'
  };

  return (
    <button
      onClick={onClick}
      className={`px-8 py-2 rounded-full font-medium transition-all ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Avatar({ src, alt = '' }) {
  return (
    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-2 shadow-xl">
      <img
        src={src || '/images/default.png'}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          e.target.src = '/images/default.png';
        }}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-white/90 text-sm">{label}</span>
      <span className="text-white/90 text-sm">:</span>
      <span className="text-white font-medium text-sm flex-1">{value}</span>
    </div>
  );
}

export default function ProfilePage() {

  // dummy data
  const [profileData] = useState({
    biodata: {
      nama: 'Josephine Elisja Basudara',
      usia: '25 tahun',
      jenisKelamin: 'Perempuan',
      pekerjaan: 'Pemilik Bisnis Boneka Labubu',
      status: 'Lajang'
    },
    latarBelakang: {
      cerita: 'Maya merinta usaha boneka Ambalabuu sejak 5 tahun lalu. Awalnya bisnis berjalan lancar karena unik dan diminati wisatawan, tapi belakangan ia merasa kewalahan. Permintaan pasar menurun, kompetitor bertambah, dan ia harus mengurus produksi, pemasaran, serta keuangan sendirian.',
      emosi: 'Maya mulai merasa usahanya stagnan, padahal ia sudah menginvestasikan banyak tenaga dan emosi. Ia takut kehilangan bisnis yang ia anggap "anak sendiri".'
    },
    kepribadian: [
      'Kreatif dan detail-oriented',
      'Perfeksionis, sulit mendelegasikan tugas',
      'Emosional, sangat terikat dengan hasil karyanya',
      'Ramah ke pelanggan, tapi tertutup pada orang terdekat soal masalah pribadi'
    ]
  });

  const handleBack = () => {
    console.log('kembali ke dashboard...');
  };

  const handleAccept = () => {
    console.log('mulai sesi...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Profil Pasien
        </h1>
        <div className="relative">
          <div className="absolute -top-16 right-4 sm:right-8 z-10">
            <Avatar 
              src={null} 
              alt={profileData.biodata.nama}
            />
          </div>

          <div className="backdrop-blur rounded-[3rem] p-6 sm:p-8 shadow-2xl pt-20 sm:pt-8">
            <section className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Biodata
              </h2>
              <div className="space-y-1">
                <InfoRow label="Nama" value={profileData.biodata.nama} />
                <InfoRow label="Usia" value={profileData.biodata.usia} />
                <InfoRow label="Jenis Kelamin" value={profileData.biodata.jenisKelamin} />
                <InfoRow label="Pekerjaan" value={profileData.biodata.pekerjaan} />
                <InfoRow label="Status" value={profileData.biodata.status} />
              </div>
            </section>

            <hr className="border-t border-white/30 my-6" />

            <section className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Latar Belakang Cerita
              </h2>
              <div className="space-y-3">
                <p className="text-white/90 text-sm leading-relaxed">
                  {profileData.latarBelakang.cerita}
                </p>
                <p className="text-white/90 text-sm leading-relaxed">
                  {profileData.latarBelakang.emosi}
                </p>
              </div>
            </section>

            <hr className="border-t border-white/30 my-6" />

            <section className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Kepribadian
              </h2>
              <ul className="space-y-2">
                {profileData.kepribadian.map((trait, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 text-white/90 text-sm"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/90 flex-shrink-0" />
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8 pt-4">
              <Button 
                variant="danger" 
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                Kembali
              </Button>
              <Button 
                variant="success" 
                onClick={handleAccept}
                className="w-full sm:w-auto"
              >
                Mulai
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}