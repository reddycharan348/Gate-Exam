
import React from 'react';
import { QuestionStatus, UserAnswer } from '../types';
import { X } from 'lucide-react';

interface QuestionPaletteProps {
  questionsCount: number;
  userAnswers: Record<number, UserAnswer>;
  currentIndex: number;
  onSelect: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({ 
  questionsCount, 
  userAnswers, 
  currentIndex, 
  onSelect,
  isOpen,
  onClose
}) => {
  const getStatusClass = (id: number) => {
    const status = userAnswers[id]?.status || QuestionStatus.NOT_VISITED;
    switch (status) {
      case QuestionStatus.ANSWERED: return 'status-answered';
      case QuestionStatus.NOT_ANSWERED: return 'status-not-answered';
      case QuestionStatus.MARKED_FOR_REVIEW: return 'status-marked';
      case QuestionStatus.MARKED_AND_ANSWERED: return 'status-marked-answered';
      default: return 'status-not-visited';
    }
  };

  const legendItems = [
    { label: 'Answered', color: 'bg-green-500' },
    { label: 'Not Visited', color: 'bg-slate-200' },
    { label: 'Review', color: 'bg-purple-500' },
  ];

  return (
    <>
      {/* Drawer Overlay for Mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-[45] md:hidden" onClick={onClose}></div>}
      
      <div className={`fixed inset-y-0 right-0 w-full md:w-80 bg-white z-[50] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} md:relative md:flex flex-col h-full border-l border-slate-200 shadow-2xl md:shadow-none`}>
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">P</div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Navigator</h3>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: questionsCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => { onSelect(i); onClose(); }}
                className={`w-10 h-10 text-[10px] font-black flex items-center justify-center transition-all ${getStatusClass(i + 1)} ${currentIndex === i ? 'ring-4 ring-blue-500/20 border-2 border-blue-500' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase tracking-widest">
            {legendItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${item.color} rounded-sm`}></div>
                <span className="text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionPalette;
