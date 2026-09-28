import React from 'react';

const Header = ({ expenses }) => {
  const totalPemasukan = expenses
    .filter(e => e.type === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalPengeluaran = expenses
    .filter(e => e.type === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldo = totalPemasukan - totalPengeluaran;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-md">
      <h1 className="text-xl font-bold mb-4 text-center">CatatVoice</h1>
      
      <div className="text-center mb-6">
        <p className="text-blue-200 text-sm mb-1">Total Saldo</p>
        <p className="text-3xl font-extrabold">{formatRupiah(saldo)}</p>
      </div>

      <div className="flex justify-between bg-blue-500 rounded-2xl p-4">
        <div className="text-center w-1/2 border-r border-blue-400">
          <p className="text-blue-100 text-xs mb-1">Pemasukan</p>
          <p className="font-semibold text-sm">{formatRupiah(totalPemasukan)}</p>
        </div>
        <div className="text-center w-1/2">
          <p className="text-blue-100 text-xs mb-1">Pengeluaran</p>
          <p className="font-semibold text-sm">{formatRupiah(totalPengeluaran)}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
