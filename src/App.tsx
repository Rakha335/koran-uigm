import React, { useState, useEffect } from 'react';
import AdminPage from './AdminPage';

const UIGMLogo = '/logo.png';

interface Saran {
  id: number;
  sender_name: string;
  category: string;
  message: string;
  created_at?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'user' | 'admin'>('landing');
  const [suggestions, setSuggestions] = useState<Saran[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'Fasilitas Kampus',
    isiSaran: ''
  });

  const kategoriList = [
    {
      nama: 'Fasilitas Kampus',
      deskripsi: 'Gedung, ruang kelas, laboratorium, area parkir, dan sarana penunjang kegiatan perkuliahan lainnya.',
    },
    {
      nama: 'Akademik',
      deskripsi: 'Jadwal perkuliahan, kinerja dosen, pengisian KRS, pengelolaan nilai, serta sistem layanan akademik.',
    },
    {
      nama: 'Kebersihan',
      deskripsi: 'Pemeliharaan kebersihan lingkungan kampus, fasilitas toilet umum, serta kenyamanan area kantin mahasiswa.',
    },
    {
      nama: 'Keamanan',
      deskripsi: 'Sistem pengamanan area parkir, pos satpam, pengawasan lingkungan, serta ketertiban kampus secara menyeluruh.',
    },
    {
      nama: 'Lainnya',
      deskripsi: 'Saran umum, kritik membangun, atau masukan berharga di luar kategori yang telah disediakan di atas.',
    },
  ];

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Gagal mengambil data dari server:', error);
    }
  };

  useEffect(() => {
    const handlePathChange = () => {
      if (window.location.pathname === '/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('landing');
      }
    };

    if (window.location.pathname === '/admin') {
      setCurrentView('admin');
    }

    window.addEventListener('popstate', handlePathChange);
    fetchSuggestions();

    return () => window.removeEventListener('popstate', handlePathChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      sender_name: formData.nama,
      category: formData.kategori,
      message: formData.isiSaran
    };

    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Berhasil: Aspirasi Anda telah terkirim ke database.');
        setFormData({ nama: '', kategori: 'Fasilitas Kampus', isiSaran: '' });
        fetchSuggestions();
        goToLanding();
      } else {
        alert('Gagal mengirim aspirasi, periksa kembali input Anda.');
      }
    } catch (error) {
      console.error('Terjadi kesalahan koneksi:', error);
      alert('Tidak dapat terhubung ke server backend FastAPI.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSaran = async (id: number) => {
    const token = sessionStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchSuggestions();
      } else {
        alert('Gagal menghapus data. Sesi Anda mungkin habis.');
      }
    } catch (error) {
      console.error('Kesalahan koneksi saat menghapus:', error);
    }
  };

  const goToLanding = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans antialiased flex flex-col justify-between bg-slate-50 overflow-y-auto">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full shadow-md py-3 bg-[#003366] backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-6 lg:px-12 gap-2">
          
          <div className="flex items-center gap-2 sm:gap-3.5 cursor-pointer select-none group min-w-0" onClick={goToLanding}>
            <div className="bg-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-sm flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <img src={UIGMLogo} alt="Logo UIGM" className="h-6 sm:h-7 w-auto object-contain block" />
            </div>
            
            <div className="h-6 sm:h-7 w-px bg-white/20 shrink-0"></div>
            
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-sky-200 leading-none">
                KORAN
              </span>
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight mt-0.5 truncate">
                UIGM
              </span>
            </div>
          </div>
          
          <div className="flex items-center shrink-0">
            {(currentView === 'user' || currentView === 'admin') && (
              <button
                onClick={goToLanding}
                className="inline-flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold bg-white text-[#003366] hover:bg-slate-100 h-8 sm:h-9 px-2.5 sm:px-4 transition-all shadow-sm hover:shadow whitespace-nowrap"
              >
                <span className="inline sm:hidden">Beranda</span>
                <span className="hidden sm:inline">Kembali ke Beranda Utama</span>
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="container mx-auto px-4 sm:px-6 py-8 lg:px-12 max-w-6xl flex-grow relative pb-20">
        
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
           <img src={UIGMLogo} alt="Watermark UIGM" style={{ width: '500px', height: 'auto' }}/>
        </div>

        {/* LANDING PAGE */}
        {currentView === 'landing' && (
          <div className="space-y-16 relative z-10 pb-12">
            
            {/* HERO SECTION */}
            <div className="w-full pt-12 pb-6 max-w-3xl text-left space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight text-[#003366]">
                  KORAN UIGM
                </h1>
                <h2 className="text-base lg:text-lg font-bold text-slate-600 tracking-wide uppercase">
                  Kotak Saran Universitas Indo Global Mandiri
                </h2>
              </div>
              <p className="text-base lg:text-lg text-slate-600 leading-relaxed">
                Media komunikasi digital bagi seluruh warga kampus untuk menyalurkan aspirasi dan kritik membangun, sebagai komitmen mewujudkan pelayanan institusi yang akuntabel dan berkualitas.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setCurrentView('user')}
                  className="inline-flex items-center justify-center rounded-xl text-sm font-semibold text-white h-12 px-8 shadow-lg shadow-[#003366]/20 transition-all hover:bg-[#002244] hover:shadow-xl active:scale-95"
                  style={{ backgroundColor: '#003366' }}
                >
                  Kirim Aspirasi & Masukan Sekarang &rarr;
                </button>
              </div>
            </div>

            {/* TENTANG (UIGM) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 lg:p-10 space-y-6">
              <div className="max-w-3xl space-y-3">
                <h3 className="text-2xl font-extrabold text-[#003366]">Universitas Indo Global Mandiri (UIGM)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Universitas Indo Global Mandiri (UIGM) adalah salah satu perguruan tinggi swasta terkemuka yang berkomitmen menghasilkan lulusan berintegritas, menguasai ilmu pengetahuan dan teknologi, serta berdaya saing global. Melalui pengembangan inovasi digital seperti <strong>KORAN UIGM</strong>, universitas terus mendorong partisipasi aktif mahasiswa dalam menciptakan lingkungan akademik yang kondusif dan solutif.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#003366]"></span> Visi UIGM
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Menjadi universitas yang unggul, mandiri, dan berdaya saing di tingkat nasional maupun internasional berbasiskan teknologi informasi pada tahun-tahun mendatang.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#003366]"></span> Misi & Budaya Kampus
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Menyelenggarakan pendidikan berkualitas, membina suasana akademik yang kondusif, serta mempererat sinergi yang harmonis antara mahasiswa, dosen, dan manajemen universitas.
                  </p>
                </div>
              </div>
            </div>

            {/* ALUR PELAYANAN & PENGADUAN */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 lg:p-10 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="text-2xl font-extrabold text-[#003366]">Alur Pelayanan & Pengaduan Aspirasi</h3>
                <p className="text-sm text-slate-500">Berikut adalah tahapan transparan bagaimana setiap aspirasi dan kritik konstruktif Anda diproses oleh pihak universitas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-base shadow-md">1</div>
                  <h4 className="font-bold text-slate-800 text-base">Pengiriman Aspirasi</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Mahasiswa mengisi formulir digital dengan memilih kategori yang sesuai, melampirkan identitas, serta rincian pesan secara objektif.</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-base shadow-md">2</div>
                  <h4 className="font-bold text-slate-800 text-base">Verifikasi & Analisis</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Tim admin universitas akan meneruskan laporan Anda ke unit atau bidang terkait di lingkungan kampus.</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-base shadow-md">3</div>
                  <h4 className="font-bold text-slate-800 text-base">Tindak Lanjut & Evaluasi</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Pengelola kampus senantiasa mengevaluasi dan memperbaiki fasilitas maupun layanan demi kenyamanan bersama.</p>
                </div>
              </div>
            </div>

            {/* INFORMASI KAMPUS & SITUS RESMI (3 Kolom) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 lg:p-10 space-y-8">
              <div>
                <h3 className="text-2xl font-extrabold text-[#003366]">Informasi Kampus & Situs Resmi</h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">
                  Alamat, jam operasional, dan tautan situs web resmi Universitas Indo Global Mandiri.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#003366]"></span> Lokasi Kampus Utama
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Jl. Kol. H. Burlian No.KM. 7, Srijaya, Kec. Alang-Alang Lebar, Kota Palembang, Sumatera Selatan.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#003366]"></span> Jam Operasional
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Senin – Jumat (08.00 - 16.00 WIB)
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#003366]"></span> Situs Web Resmi
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <a href="https://uigm.ac.id" target="_blank" rel="noopener noreferrer" className="text-[#003366] underline font-medium hover:text-[#002244]">
                      www.uigm.ac.id
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* KUTIPAN MOTIVASI & SLOGAN AKADEMIK KAMPUS */}
            <div className="bg-gradient-to-r from-[#003366] to-[#002244] rounded-3xl shadow-xl p-8 lg:p-10 text-center text-white space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-sky-200">Slogan Akademik Kampus</h3>
              <blockquote className="text-base lg:text-lg font-medium italic max-w-2xl mx-auto leading-relaxed text-slate-100">
                &ldquo;Integritas, Inovasi, dan Keunggulan Global. Bersama membangun budaya akademik Universitas Indo Global Mandiri yang unggul, solutif, dan berdaya saing.&rdquo;
              </blockquote>
            </div>

          </div>
        )}

        {/* HALAMAN USER / FORM ASPIRASI */}
        {currentView === 'user' && (
          <div className="max-w-xl mx-auto rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 p-6 sm:p-8 lg:p-10 w-full relative z-10 my-8">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-[#003366]">Formulir Pengiriman Aspirasi</h3>
              <p className="text-sm text-slate-500 mt-1">Silakan lengkapi data diri, pilih kategori yang sesuai, dan sampaikan saran atau kritik konstruktif Anda demi kemajuan Universitas Indo Global Mandiri.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nama Lengkap Mahasiswa / Pengirim</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] transition-all"
                  placeholder="Masukkan nama lengkap Anda..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Pilih Kategori Masukan & Topik Pembahasan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {kategoriList.map((kat) => {
                    const isSelected = formData.kategori === kat.nama;
                    return (
                      <div
                        key={kat.nama}
                        onClick={() => setFormData({...formData, kategori: kat.nama})}
                        className={`cursor-pointer rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-[#003366] bg-[#003366]/5 shadow-sm ring-1 ring-[#003366]'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800">{kat.nama}</h4>
                          {isSelected && (
                            <span className="h-4 w-4 rounded-full bg-[#003366] text-white text-[10px] flex items-center justify-center font-bold">✓</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{kat.deskripsi}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Rincian Saran, Kritik, atau Aspirasi Kampus</label>
                <textarea
                  required
                  rows={4}
                  value={formData.isiSaran}
                  onChange={(e) => setFormData({...formData, isiSaran: e.target.value})}
                  className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] transition-all resize-none"
                  placeholder="Tuliskan aspirasi, kritik membangun, atau saran perbaikan secara rinci, jelas, dan santun di sini..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl text-sm font-semibold text-white h-12 w-full transition-all shadow-lg shadow-[#003366]/20 hover:bg-[#002244] active:scale-95 disabled:opacity-70"
                style={{ backgroundColor: '#003366' }}
              >
                {loading ? 'Sedang Mengirim Aspirasi...' : 'Kirim Aspirasi & Saran Sekarang'}
              </button>
            </form>
          </div>
        )}

        {/* HALAMAN ADMIN */}
        {currentView === 'admin' && (
          <div className="w-full relative z-10 my-4">
            <AdminPage
              suggestions={suggestions}
              onDelete={handleDeleteSaran}
            />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 relative z-10 space-y-2">
        <p>Kotak Saran Universitas Indo Global Mandiri 2026</p>
      </footer>

    </div>
  );
}