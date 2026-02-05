
import React from 'react';
import { Analysis, Question, UserAnswer, QuestionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle2, XCircle, Award, Target, BookOpen } from 'lucide-react';

interface ResultAnalysisProps {
  analysis: Analysis | null;
  questions: Question[];
  userAnswers: Record<number, UserAnswer>;
  onRestart: () => void;
}

const ResultAnalysis: React.FC<ResultAnalysisProps> = ({ analysis, questions, userAnswers, onRestart }) => {
  if (!analysis) return <div className="p-10 text-center">Loading detailed analysis...</div>;

  const chartData = analysis.sectionPerformance.map(s => ({
    name: s.section,
    score: s.score,
    total: s.total
  }));

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      const uAns = userAnswers[q.id];
      if (!uAns || uAns.answer === '') return;

      const isCorrect = JSON.stringify(uAns.answer) === JSON.stringify(q.correctAnswer);
      
      if (isCorrect) {
        score += q.marks;
      } else {
        // Negative marking for MCQs
        if (q.type === QuestionType.MCQ) {
          score -= (q.marks / 3);
        }
      }
    });
    return score.toFixed(2);
  };

  const finalScore = calculateScore();

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white mb-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="bg-white/20 p-4 rounded-full">
            <Award size={48} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Exam Completed!</h1>
            <p className="text-blue-100 opacity-90">Based on GATE 2026 official marking scheme.</p>
          </div>
        </div>
        <div className="text-center md:text-right">
          <div className="text-5xl font-black mb-1">{finalScore}</div>
          <div className="text-sm font-medium uppercase tracking-widest text-blue-200">Total Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Target className="text-blue-500" /> Section-wise Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score / entry.total > 0.7 ? '#22c55e' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BookOpen className="text-indigo-500" /> AI Insights
          </h3>
          <div className="space-y-4">
            {analysis.improvementAreas.map((area, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="mt-1 min-w-[20px] h-[20px] rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-600">{area}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">Detailed Answer Key</div>
        <div className="divide-y divide-slate-100">
          {questions.map((q, i) => {
            const uAns = userAnswers[q.id];
            const isCorrect = JSON.stringify(uAns?.answer) === JSON.stringify(q.correctAnswer);
            return (
              <div key={q.id} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-bold text-slate-800">Q{i+1}. {q.text}</h4>
                  {isCorrect ? <CheckCircle2 className="text-green-500 shrink-0" /> : <XCircle className="text-red-500 shrink-0" />}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div className="p-3 rounded bg-slate-50">
                    <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Your Answer</span>
                    <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {Array.isArray(uAns?.answer) ? uAns.answer.join(', ') : uAns?.answer || 'Not Answered'}
                    </span>
                  </div>
                  <div className="p-3 rounded bg-blue-50 border border-blue-100">
                    <span className="block text-xs uppercase font-bold text-blue-400 mb-1">Correct Answer</span>
                    <span className="text-blue-700 font-bold">
                      {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 italic">
                  <span className="font-bold">Explanation:</span> {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
      >
        Take Another Mock Test
      </button>
    </div>
  );
};

export default ResultAnalysis;
