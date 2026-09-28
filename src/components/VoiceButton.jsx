import React from 'react';
import { Mic, Loader2 } from 'lucide-react';

const VoiceButton = ({ isRecording, isProcessing, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={isProcessing}
      className={`
        flex items-center justify-center
        w-20 h-20 rounded-full shadow-2xl transition-all duration-300
        ${isRecording 
          ? 'bg-red-500 animate-pulse scale-110' 
          : isProcessing
            ? 'bg-blue-400 cursor-not-allowed scale-100'
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
        }
      `}
      aria-label="Rekam Suara"
    >
      {isProcessing ? (
        <Loader2 size={36} color="white" className="animate-spin" />
      ) : (
        <Mic size={36} color="white" />
      )}
    </button>
  );
};

export default VoiceButton;
