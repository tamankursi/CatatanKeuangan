import React, { useState } from 'react';
import { Utensils, Car, Wallet, HelpCircle, Trash2, Pencil, ShoppingBag, Gamepad2, HeartPulse, GraduationCap, Receipt } from 'lucide-react';

const getCategoryIcon = (category) => {
  const c = (category || '').toLowerCase();
  if (c.includes('makan') || c.includes('minum') || c.includes('kopi')) return <Utensils size={18} />;
  if (c.includes('transport') || c.includes('bensin')) return <Car size={18} />;
  if (c.includes('gaji') || c.includes('uang') || c.includes('saldo') || c.includes('transfer')) return <Wallet size={18} />;
  if (c.includes('belanja')) return <ShoppingBag size={18} />;
  if (c.includes('hiburan')) return <Gamepad2 size={18} />;
  if (c.includes('kesehatan')) return <HeartPulse size={18} />;
  if (c.includes('pendidikan')) return <GraduationCap size={18} />;
  if (c.includes('tagihan')) return <Receipt size={18} />;
  return <HelpCircle size={18} />;
};

const ExpenseList = ({ expenses, onDelete, onEdit }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleDeleteClick = (id) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId((prev) => (prev === id ? null : prev)), 3000);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-16">
        <p className="text-5xl mb-3">📭</p>
        <p className="font-medium">Belum ada transaksi.</p>
        <p className="text-sm mt-1">Tekan tombol mikrofon atau (+) untuk mulai mencatat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const isConfirming = confirmDeleteId === expense.id;
        return (
          <div
            key={expense.id}
            className={`bg-white p-4 rounded-2xl shadow-sm border transition-colors duration-200 ${
              isConfirming ? 'border-red-300 bg-red-50' : 'border-gray-100'
            }`}
          >
            {/* Top row: icon + info + amount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-full flex-shrink-0 ${
                    expense.type === 'Pemasukan'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {getCategoryIcon(expense.category)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-sm">{expense.category}</p>
                  <p className="text-xs text-gray-400">
                    {expense.date} • {expense.time}
                  </p>
                  {expense.note && (
                    <p className="text-xs text-gray-400 mt-0.5 italic truncate">"{expense.note}"</p>
                  )}
                </div>
              </div>

              <div
                className={`font-bold text-sm whitespace-nowrap ml-3 ${
                  expense.type === 'Pemasukan' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {expense.type === 'Pemasukan' ? '+' : '-'}
                {formatRupiah(expense.amount)}
              </div>
            </div>

            {/* Bottom row: action buttons */}
            <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-gray-50">
              <button
                onClick={() => onEdit(expense)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(expense.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isConfirming
                    ? 'bg-red-500 text-white'
                    : 'text-red-500 hover:bg-red-50'
                }`}
              >
                <Trash2 size={14} />
                {isConfirming ? 'Yakin hapus?' : 'Hapus'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseList;
