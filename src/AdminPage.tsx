import React, { useState } from 'react';
import { Laptop, GraduationCap, Sparkles, Shield, Megaphone, ChevronDown } from 'lucide-react';

interface Saran {
  id: number;
  sender_name: string;
  category: string;
  message: string;
  created_at?: string;
}

interface Kategori {
  id: number;
  name: string;
  icon?: string;
}

interface AdminPageProps {
  suggestions: Saran[];
  categories: Kategori[];
  onDelete: (id: number) => void;
  onAddCategory: (newCategory: { name: string; icon: string }) => void;
  onDeleteCategory: (catId: number) => void;
}

const renderCategoryIcon = (iconName?: string, categoryName?: string, isActive: boolean = false) => {
  const cleanIcon = (iconName || '').trim().toLowerCase();
  const cleanCat = (categoryName || '').trim().toLowerCase();
  const className = "w-5 h-5 shrink-0";

  if (isActive) {
    if (cleanCat.includes('keamanan') || cleanIcon.includes('shield')) return <Shield className={className} color="#ffffff" />;
    if (cleanCat.includes('lainnya') || cleanIcon.includes('megaphone')) return <Megaphone className={className} color="#ffffff" />;
    return <Laptop className={className} color="#ffffff" />;
  }

  if (cleanCat.includes('fasilitas') || cleanIcon.includes('laptop')) return <Laptop className={className} color="#2563eb" />;
  if (cleanCat.includes('akademik') || cleanIcon.includes('graduation')) return <GraduationCap className={className} color="#4f46e5" />;
  if (cleanCat.includes('kebersihan') || cleanIcon.includes('sparkles')) return <Sparkles className={className} color="#d97706" />;
  if (cleanCat.includes('keamanan') || cleanIcon.includes('shield')) return <Shield className={className} color="#2563eb" />;
  if (cleanCat.includes('lainnya') || cleanIcon.includes('megaphone')) return <Megaphone className={className} color="#dc2626" />;

  return <Megaphone className={className} color="#003366" />;
};

export default function AdminPage({ 
  suggestions, 
  categories, 
  onDelete, 
  onAddCategory, 
  onDeleteCategory 
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [showCategoryManager, setShowCategoryManager] = useState<boolean>(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!sessionStorage.getItem('admin_token');
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // State form kategori tanpa field description
  const [newCatForm, setNewCatForm] = useState({ name: '', icon: 'Laptop' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatForm.name.trim()) return;
    onAddCategory(newCatForm);
    setNewCatForm({ name: '', icon: 'Laptop' });
  };

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

  const filteredSuggestions = activeTab === 'Semua' 
    ? suggestions 
    : suggestions.filter(item => item.category.toLowerCase() === activeTab.toLowerCase());

  const countCategory = (catName: string) => {
    return suggestions.filter(item => item.category.toLowerCase() === catName.toLowerCase()).length;
  };

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

  const iconOptions = [
    { label: 'Fasilitas (Laptop)', value: 'Laptop' },
    { label: 'Akademik (GraduationCap)', value: 'GraduationCap' },
    { label: 'Kebersihan (Sparkles)', value: 'Sparkles' },
    { label: 'Keamanan (Shield)', value: 'Shield' },
    { label: 'Lainnya (Megaphone)', value: 'Megaphone' },
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
      
      {/* SIDEBAR ADMIN */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base" style={{ color: '#003366' }}>ADMINISTRATOR</h3>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">Navigasi Utama</p>
            <button 
              onClick={() => { setActiveTab('Semua'); setShowCategoryManager(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition ${
                !showCategoryManager && activeTab === 'Semua' ? 'bg-[#003366] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>Semua Aspirasi</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${!showCategoryManager && activeTab === 'Semua' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {suggestions.length}
              </span>
            </button>

            <button 
              onClick={() => setShowCategoryManager(true)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition mt-1 ${
                showCategoryManager ? 'bg-[#003366] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>⚙️ Kelola Kategori</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${showCategoryManager ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {categories.length}
              </span>
            </button>
          </div>

          <div className="space-y-1 pt-2">
            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">Kategori Kampus</p>
            {categories.map((cat) => {
              const isCategoryActive = !showCategoryManager && activeTab.toLowerCase() === cat.name.toLowerCase();

              return (
                <button 
                  key={cat.id}
                  onClick={() => { setActiveTab(cat.name); setShowCategoryManager(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition ${
                    isCategoryActive ? 'bg-[#003366] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {renderCategoryIcon(cat.icon, cat.name, isCategoryActive)}
                    <span className={`truncate capitalize ${isCategoryActive ? 'text-white' : 'text-gray-700'}`}>{cat.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${isCategoryActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {countCategory(cat.name)}
                  </span>
                </button>
              );
            })}
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

      {/* KONTEN UTAMA */}
      <div className="md:col-span-3 space-y-6">
        
        {showCategoryManager ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: '#003366' }}>
                Pengaturan Kategori Aspirasi
              </h2>
              <p className="text-xs text-gray-500">Tambah atau hapus kategori masukan beserta ikonnya yang tersedia untuk mahasiswa.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">➕ Tambah Kategori Baru</h3>
              <form onSubmit={handleCategorySubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Nama Kategori</label>
                  <input
                    type="text"
                    required
                    value={newCatForm.name}
                    onChange={(e) => setNewCatForm({...newCatForm, name: e.target.value})}
                    placeholder="Contoh: Fasilitas, Akademik, Kebersihan"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] mt-1"
                  />
                </div>

                {/* CUSTOM DROPDOWN UNTUK IKON KATEGORI */}
                <div className="relative">
                  <label className="text-xs font-medium text-gray-700">Pilih Ikon Kategori</label>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] mt-1"
                  >
                    <div className="flex items-center gap-2">
                      {renderCategoryIcon(newCatForm.icon, newCatForm.icon, false)}
                      <span className="capitalize">{newCatForm.icon}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                      {iconOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setNewCatForm({...newCatForm, icon: opt.value});
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition"
                        >
                          {renderCategoryIcon(opt.value, opt.value, false)}
                          <span>{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white hover:opacity-95 h-10 px-4 transition shadow-sm"
                  style={{ backgroundColor: '#003366' }}
                >
                  Simpan Kategori Baru
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Daftar Kategori Aktif</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                        {renderCategoryIcon(cat.icon, cat.name, false)}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 capitalize">{cat.name}</h4>
                    </div>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="text-xs text-red-600 bg-white border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-md transition font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold tracking-tight capitalize" style={{ color: '#003366' }}>
                  {activeTab === 'Semua' ? 'Semua Data Aspirasi' : `Kategori: ${activeTab}`}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Daftar masukan mahasiswa dari database.</p>
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
                        <p className="text-[11px] text-gray-400">
                          🕒 Masuk pada: {formatDate(item.created_at)}
                        </p>
                      </div>

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
        )}

      </div>

    </div>
  );
}