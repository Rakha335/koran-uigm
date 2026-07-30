import React, { useState } from 'react';

interface saran {
  id: number;
  sender_name: string;
  category: string;
  message: string;
  created_at?: string;
}

interface AdminPageProps {
  suggestions: saran[];
  onDelete: (id: number) => void;
}

export default function AdminPage({ suggestions, onDelete }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!sessionStorage.getItem('admin_token');
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', loginForm.username);
      formData.append('password', loginForm.password);

      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('admin_token', data.access_token);
        setIsLoggedIn(true);
      } else {
        setLoginError('Username atau password salah!');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Terjadi kesalahan koneksi ke server.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  // Jika belum login, tampilkan form login admin
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto rounded-xl border border-gray-200 bg-white shadow-sm p-8 w-full my-auto space-y-6 relative z-10">
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-bold tracking-tight" style={{ color: '#003366' }}>Login Admin</h3>
          <p className="text-sm text-gray-500">Masukkan kredensial untuk mengelola data KORAN UIGM.</p>
        </div>

        {loginError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" 
              required
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              placeholder="Masukkan username admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              placeholder="Masukkan password admin"
            />
          </div>

          <button 
            type="submit" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white hover:opacity-95 h-10 w-full transition shadow-sm mt-2"
            style={{ backgroundColor: '#003366' }}
          >
            Masuk Dashboard
          </button>
        </form>
      </div>
    );
  }

  // Filter data berdasarkan kategori/tab yang dipilih di sidebar
  const filteredSuggestions = activeTab === 'Semua' 
    ? suggestions 
    : suggestions.filter(item => item.category === activeTab);

  // Hitung jumlah data per kategori untuk badge sidebar
  const countCategory = (catName: string) => {
    return suggestions.filter(item => item.category === catName).length;
  };

  // Helper untuk format tanggal agar mudah dibaca
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Waktu tidak tersedia';
    try {
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
      
      {/* SIDEBAR ADMIN */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base" style={{ color: '#003366' }}>ADMINISTRATOR</h3>
            <p className="text-[11px] text-gray-500">KORAN UIGM v1.0 (Protected)</p>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">Utama</p>
            <button 
              onClick={() => setActiveTab('Semua')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition ${
                activeTab === 'Semua' ? 'bg-[#003366] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>Semua Aspirasi</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'Semua' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {suggestions.length}
              </span>
            </button>
          </div>

          <div className="space-y-1 pt-2">
            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">Kategori Khusus</p>
            {['Fasilitas Kampus', 'Akademik', 'Kebersihan', 'Keamanan', 'Lainnya'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition ${
                  activeTab === cat ? 'bg-[#003366] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${activeTab === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {countCategory(cat)}
                </span>
              </button>
            ))}
          </div>

          <hr className="border-gray-100 pt-2" />

          <button 
            onClick={handleLogout}
            className="w-full text-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            Keluar (Logout)
          </button>
        </div>
      </div>

      {/* KONTEN DAFTAR ASPIRASI */}
      <div className="md:col-span-3 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: '#003366' }}>
              {activeTab === 'Semua' ? 'Semua Data Aspirasi' : `Kategori: ${activeTab}`}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Daftar masukan mahasiswa dari database.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              SECURE ONLINE
            </span>
          </div>
        </div>

        {filteredSuggestions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-2 shadow-sm">
            <p className="text-gray-400 font-medium">Belum ada data aspirasi pada kategori ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuggestions.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 transition hover:border-gray-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                        {item.sender_name}
                      </span>
                      <span className="text-[10px] font-semibold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                        {item.category}
                      </span>
                    </div>
                    {/* Waktu Masuk Saran */}
                    <p className="text-[11px] text-gray-400">
                      🕒 Masuk pada: {formatDate(item.created_at)}
                    </p>
                  </div>

                  {/* Tombol Hapus Utama */}
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition border border-red-200"
                    title="Hapus Aspirasi"
                  >
                    <span>🗑️ Hapus Aspirasi</span>
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-700 italic">"{item.message}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}