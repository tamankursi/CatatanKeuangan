import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ExpenseList from './components/ExpenseList';
import VoiceButton from './components/VoiceButton';
import TransactionModal from './components/TransactionModal';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Plus } from 'lucide-react';
import {
  getAllTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  seedIfEmpty,
} from './db';

const SEED_DATA = [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    category: 'Saldo Awal',
    type: 'Pemasukan',
    amount: 1000000,
    note: 'Modal awal',
  },
];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null); // null = add mode, object = edit mode

  const recognitionRef = useRef(null);

  // ── Load from IndexedDB on mount ──
  useEffect(() => {
    seedIfEmpty(SEED_DATA).then(setExpenses).catch(console.error);
  }, []);

  // ── Delete handler ──
  const handleDelete = useCallback(async (id) => {
    try {
      await deleteTransaction(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Gagal menghapus transaksi:', err);
    }
  }, []);

  // ── Open modal for adding ──
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  // ── Open modal for editing ──
  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  // ── Save from modal (add or edit) ──
  const handleModalSave = useCallback(async (data) => {
    try {
      if (editingExpense) {
        // Update existing
        await updateTransaction(data);
        setExpenses((prev) =>
          prev.map((e) => (e.id === data.id ? data : e))
        );
      } else {
        // Add new
        await addTransaction(data);
        setExpenses((prev) => [data, ...prev]);
      }
      setModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      console.error('Gagal menyimpan transaksi:', err);
    }
  }, [editingExpense]);

  // ── Speech Recognition setup ──
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser Anda tidak mendukung Web Speech API. Gunakan Google Chrome atau Edge.');
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setStatusText('Mendengarkan...');
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setStatusText(`Memproses: "${transcript}"`);
      await processTranscriptWithGemini(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      setStatusText('Gagal mendengarkan. Coba lagi.');
      setTimeout(() => setStatusText(''), 3000);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return recognition;
  };

  // ── Gemini processing ──
  const processTranscriptWithGemini = async (transcript) => {
    setIsProcessing(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MASUKKAN_API_KEY_GEMINI_ANDA_DI_SINI') {
        alert('API Key Gemini belum diatur. Silakan masukkan API Key Anda di file .env');
        setIsProcessing(false);
        setStatusText('');
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Anda adalah asisten pencatat keuangan. Ekstrak informasi dari teks berikut menjadi format JSON terstruktur.
Teks: "${transcript}"

Format JSON yang diwajibkan:
{
  "jumlah": angka bulat (hanya angka tanpa titik/koma/simbol),
  "kategori": "Nama Kategori (contoh: Makanan/Minuman, Transportasi, dll)",
  "jenis": "Pengeluaran" atau "Pemasukan",
  "catatan": "Catatan singkat dari ucapan"
}
Hanya kembalikan teks berformat JSON murni tanpa markdown, tanpa backtick, dan tanpa teks tambahan apapun.`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

      const data = JSON.parse(responseText);

      const now = new Date();
      const newExpense = {
        id: Date.now(),
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: data.kategori || 'Lainnya',
        type: (data.jenis || '').toLowerCase().includes('pemasukan') ? 'Pemasukan' : 'Pengeluaran',
        amount: Number(data.jumlah) || 0,
        note: data.catatan || transcript,
      };

      // Persist to IndexedDB then update state
      await addTransaction(newExpense);
      setExpenses((prev) => [newExpense, ...prev]);
      setStatusText('Berhasil dicatat!');
    } catch (error) {
      console.error('Error saat memproses dengan Gemini:', error);
      setStatusText('Gagal memproses ucapan. Coba lagi.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusText(''), 3000);
    }
  };

  // ── Toggle recording ──
  const handleVoiceRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      if (!recognitionRef.current) {
        recognitionRef.current = initSpeechRecognition();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto shadow-xl relative pb-28">
      <Header expenses={expenses} />

      <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Riwayat Transaksi</h2>
        <ExpenseList expenses={expenses} onDelete={handleDelete} onEdit={handleOpenEdit} />
      </main>

      {/* Floating Status Text */}
      {statusText && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-10 whitespace-nowrap">
          {statusText}
        </div>
      )}

      {/* ── Floating Action Buttons ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {/* Add Manual (+) Button */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl transition-all hover:scale-105"
          aria-label="Tambah manual"
        >
          <Plus size={28} strokeWidth={3} />
        </button>

        {/* Voice Button */}
        <VoiceButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onClick={handleVoiceRecord}
        />
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleModalSave}
        editData={editingExpense}
      />
    </div>
  );
}

export default App;
