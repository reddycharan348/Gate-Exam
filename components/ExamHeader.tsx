
import React, { useState, useEffect } from 'react';
import { Calculator, Clock, AlertCircle } from 'lucide-react';

interface ExamHeaderProps {
  subject: string;
  timeLeft: number;
  onOpenCalc: () => void;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({ subject, timeLeft, onOpenCalc }) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 text-white p-2 rounded">
          <AlertCircle size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">GATE 2026 Mock Test</h1>
          <p className="text-xs text-slate-500 uppercase font-medium">{subject}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${isLowTime ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
          <Clock size={18} className={isLowTime ? 'animate-pulse' : ''} />
          <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
        </div>
        
        <button 
          onClick={onOpenCalc}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          <Calculator size={18} />
          Calculator
        </button>
      </div>
    </header>
  );
};

export default ExamHeader;
