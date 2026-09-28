import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = [
  'Makanan/Minuman',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Tagihan',
  'Gaji',
  'Transfer',
  'Lainnya',
];

const emptyForm = {
  type: 'Pengeluaran',
  amount: '',
  category: CATEGORIES[0],
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
  note: '',
};

const TransactionModal = ({ isOpen, onClose, onSave, editData }) => {
  const [form, setForm] = useState(emptyForm);

  // When the modal opens for editing, pre-fill the form
  useEffect(() => {
    if (editData) {
      setForm({
        type: editData.type || 'Pengeluaran',
        amount: String(editData.amount || ''),
        category: editData.category || CATEGORIES[0],
        date: editData.date || new Date().toISOString().split('T')[0],
        time: editData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        note: editData.note || '',
      });
    } else {
      setForm({
        ...emptyForm,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      alert('Masukkan jumlah yang valid.');
      return;
    }
    onSave({
      id: editData?.id || Date.now(),
      type: form.type,
      amount,
      category: form.category,
      date: form.date,
      time: form.time,
      note: form.note,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal panel — slides up from bottom on mobile */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X size={22} />
        </button>

        <h2 className="text-lg font-bold text-gray-800 mb-5">
          {editData ? 'Edit Transaksi' : 'Tambah Transaksi'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jenis toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Jenis</label>
            <div className="flex gap-2">
              {['Pengeluaran', 'Pemasukan'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleChange('type', t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    form.type === t
                      ? t === 'Pengeluaran'
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Jumlah (Rp)</label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="50000"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal & Jam */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Jam</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Catatan</label>
            <input
              type="text"
              placeholder="Contoh: makan siang"
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors mt-2"
          >
            {editData ? 'Simpan Perubahan' : 'Tambah Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
