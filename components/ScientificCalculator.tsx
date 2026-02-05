
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CalculatorProps {
  onClose: () => void;
}

const ScientificCalculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');

  const buttons = [
    '7', '8', '9', '/', 'C',
    '4', '5', '6', '*', 'sqrt',
    '1', '2', '3', '-', 'sin',
    '0', '.', '=', '+', 'log'
  ];

  const handleAction = (btn: string) => {
    if (btn === 'C') setDisplay('0');
    else if (btn === '=') {
        try {
            // Very basic calc for demo
            setDisplay(eval(display).toString());
        } catch {
            setDisplay('Error');
        }
    } else {
        setDisplay(prev => prev === '0' ? btn : prev + btn);
    }
  };

  return (
    <div className="fixed top-20 right-4 w-64 bg-slate-800 text-white rounded-lg shadow-2xl p-4 z-50 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scientific Calculator</h3>
        <button onClick={onClose} className="hover:text-red-400"><X size={16} /></button>
      </div>
      <div className="bg-slate-900 p-2 mb-4 rounded text-right text-xl font-mono truncate h-10 leading-6">
        {display}
      </div>
      <div className="grid grid-cols-5 gap-1">
        {buttons.map(btn => (
          <button
            key={btn}
            onClick={() => handleAction(btn)}
            className="bg-slate-700 hover:bg-slate-600 p-2 text-xs rounded transition-colors"
          >
            {btn}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-500 italic">Simulated for demo purposes</p>
    </div>
  );
};

export default ScientificCalculator;
