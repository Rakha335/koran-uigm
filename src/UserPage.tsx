import React, { useState } from 'react';
import { BookOpen, Laptop, Building2, Megaphone, Users, GraduationCap } from 'lucide-react';

interface Kategori {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

interface UserPageProps {
  categories: Kategori[];
  onSubmitSuggestion: (suggestion: { sender_name: string; category: string; message: string }) => void;
}

// Helper function perender ikon yang mendeteksi iconName ATAU nama kategori secara aman
const renderCategoryIcon = (iconName?: string, categoryName?: string) => {
  const iconClass = "w-4 h-4 text-[#003366]";
  
  const cleanIcon = (iconName || '').trim().toLowerCase();
  const cleanCat = (categoryName || '').trim().toLowerCase();

  if (
    cleanIcon.includes('graduation') || cleanIcon.includes('topi') || 
    cleanCat.includes('akademik') || cleanCat.includes('mahasiswa') || cleanCat.includes('kuliah')
  ) {
    return <GraduationCap className={iconClass} />;
  }
  if (
    cleanIcon.includes('book') || cleanIcon.includes('buku') || 
    cleanCat.includes('literatur') || cleanCat.includes('perpus')
  ) {
    return <BookOpen className={iconClass} />;
  }
  if (
    cleanIcon.includes('laptop') || cleanIcon.includes('komputer') || 
    cleanCat.includes('fasilitas') || cleanCat.includes('sarana') || cleanCat.includes('lab')
  ) {
    return <Laptop className={iconClass} />;
  }
  if (
    cleanIcon.includes('building') || cleanIcon.includes('gedung') || 
    cleanCat.includes('kampus') || cleanCat.includes('sarana')
  ) {
    return <Building2 className={iconClass} />;
  }
  if (
    cleanIcon.includes('mega') || cleanIcon.includes('pengumuman') || 
    cleanCat.includes('aspirasi') || cleanCat.includes('saran') || cleanCat.includes('masukan')
  ) {
    return <Megaphone className={iconClass} />;
  }
  if (
    cleanIcon.includes('user') || cleanIcon.includes('kemahasiswaan') || 
    cleanCat.includes('organisasi') || cleanCat.includes('ukm')
  ) {
    return <Users className={iconClass} />;
  }
  
  // Default fallback ke Megaphone agar tidak ada tanda tanya (?) yang muncul
  return <Megaphone className={iconClass} />;
};

export default function UserPage({ categories, onSubmitSuggestion }: UserPageProps) {
  const [form, setForm] = useState({
    sender_name: '',
    category: categories[0]?.name || '',
    message: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sender_name.trim() || !form.message.trim()) return;

    onSubmitSuggestion(form);
    setSuccessMessage('Aspirasi berhasil dikirimkan!');
    setForm({
      sender_name: '',
      category: categories[0]?.name || '',
      message: ''
    });

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 relative z-10">
      
      {/* HEADER KARTU */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-1">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: '#003366' }}>
          Kirim Aspirasi Kampus
        </h2>
        <p className="text-xs text-gray-500">Sampaikan masukan, saran, atau laporan Anda untuk kemajuan bersama.</p>
      </div>

      {/* NOTIFIKASI BERHASIL */}
      {successMessage && (
        <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
          {successMessage}
        </div>
      )}

      {/* FORM PENGISIAN */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Nama Pengirim / NIM</label>
            <input 
              type="text" 
              required
              value={form.sender_name}
              onChange={(e) => setForm({...form, sender_name: e.target.value})}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              placeholder="Contoh: Ahmad Fauzan (220xxxx)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Pilih Kategori Aspirasi</label>
            <select
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Pesan / Aspirasi</label>
            <textarea 
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              placeholder="Tuliskan aspirasi atau masukan Anda secara jelas..."
            />
          </div>

          <button 
            type="submit" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white hover:opacity-95 h-10 w-full transition shadow-sm mt-2"
            style={{ backgroundColor: '#003366' }}
          >
            Kirim Aspirasi
          </button>
        </form>
      </div>

      {/* DAFTAR PILIHAN KATEGORI AKTIF DENGAN IKON */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Panduan Kategori & Ikon Kampus</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
              <div className="p-2 rounded-lg bg-white border border-gray-200">
                {renderCategoryIcon(cat.icon, cat.name)}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-slate-800 truncate">{cat.name}</h4>
                <p className="text-[11px] text-gray-500 truncate">{cat.description || 'Kategori aktif'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}