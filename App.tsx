
import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, TestType, Question, UserAnswer, QuestionStatus, Analysis, QuestionType } from './types';
import { generateGatePaper, analyzePerformance } from './services/geminiService';
import ExamHeader from './components/ExamHeader';
import QuestionPalette from './components/QuestionPalette';
import ScientificCalculator from './components/ScientificCalculator';
import ResultAnalysis from './components/ResultAnalysis';
import { 
  ChevronLeft, ChevronRight, Send, Flag, BrainCircuit, 
  Loader2, Info, LayoutGrid, Timer, Book, Menu, X, Trash2
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'EXAM' | 'RESULTS'>('HOME');
  const [subject, setSubject] = useState('Computer Science');
  const [testType, setTestType] = useState<TestType>(TestType.FULL);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MODERATE);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [timeLeft, setTimeLeft] = useState(10800); 
  const [showCalc, setShowCalc] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExam = async () => {
    setLoading(true);
    try {
      const q = await generateGatePaper(subject, difficulty, testType, (msg) => setLoadingMsg(msg));
      setQuestions(q);
      setTimeLeft(testType === TestType.FULL ? 10800 : 1800);
      setUserAnswers({});
      setCurrentIndex(0);
      setView('EXAM');
    } catch (e) {
      alert("Failed to load unique questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async () => {
    setLoading(true);
    setLoadingMsg("Syncing results with AI...");
    try {
      const answersList = Object.values(userAnswers);
      const res = await analyzePerformance(answersList);
      
      const score = questions.reduce((acc, q) => {
        const u = userAnswers[q.id];
        if (!u || !u.answer) return acc;
        const isCorrect = JSON.stringify(u.answer) === JSON.stringify(q.correctAnswer);
        if (isCorrect) return acc + q.marks;
        if (q.type === QuestionType.MCQ) return acc - (q.marks / 3);
        return acc;
      }, 0);

      setAnalysis({
        score: parseFloat(score.toFixed(2)),
        totalPossible: questions.reduce((a, b) => a + b.marks, 0),
        accuracy: 0,
        improvementAreas: res.improvementAreas || [],
        sectionPerformance: res.sectionPerformance || []
      });
      setView('RESULTS');
    } catch (e) {
      alert("Analysis failed. Redirecting to raw results.");
      setView('RESULTS');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const uAns = userAnswers[currentQuestion?.id]?.answer || (currentQuestion?.type === QuestionType.MSQ ? [] : '');

  if (view === 'HOME') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 md:p-8 font-inter overflow-x-hidden">
        {/* Background Accents */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>

        <div className="max-w-4xl w-full z-10 space-y-8 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest">
              <BrainCircuit size={16} /> AI-Powered Simulator 2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              GATE PREP <span className="text-blue-500">AI</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              The only platform that generates fresh, non-repeating mock tests tailored to the GATE 2026 blueprint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div 
              onClick={() => setTestType(TestType.FULL)}
              className={`group cursor-pointer p-8 rounded-3xl border-2 transition-all ${testType === TestType.FULL ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.3)]' : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'}`}
            >
              <Timer size={32} className="mb-4 text-blue-300" />
              <h3 className="text-xl font-black mb-2">100-Mark Marathon</h3>
              <p className="text-sm opacity-70">65 Questions | 180 Mins. Full length technical & aptitude experience.</p>
            </div>

            <div 
              onClick={() => setTestType(TestType.APTITUDE)}
              className={`group cursor-pointer p-8 rounded-3xl border-2 transition-all ${testType === TestType.APTITUDE ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'}`}
            >
              <LayoutGrid size={32} className="mb-4 text-emerald-300" />
              <h3 className="text-xl font-black mb-2">Aptitude Sprint</h3>
              <p className="text-sm opacity-70">15 Questions | 30 Mins. Focused practice on General Aptitude sections.</p>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 text-left">
              <label className="text-xs font-black uppercase text-slate-500">Engineering Branch</label>
              <select 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl p-4 text-lg font-bold outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
              >
                <option>Computer Science</option>
                <option>Mechanical</option>
                <option>Electrical</option>
                <option>Electronics</option>
                <option>Civil</option>
              </select>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-black uppercase text-slate-500">Test Intensity</label>
              <div className="flex bg-slate-800 p-1 rounded-xl">
                {[Difficulty.EASY, Difficulty.MODERATE, Difficulty.DIFFICULT].map(d => (
                  <button 
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${difficulty === d ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={startExam}
            disabled={loading}
            className="w-full md:w-auto px-12 py-5 bg-white text-slate-900 text-xl font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'CONSTRUCT TEST'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden font-inter">
      <ExamHeader subject={subject} timeLeft={timeLeft} onOpenCalc={() => setShowCalc(!showCalc)} />
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-100">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Question Card */}
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-200/60 p-6 md:p-12 min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black">{currentIndex + 1}</span>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{currentQuestion.section}</h4>
                      <p className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-block font-bold">{currentQuestion.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">+{currentQuestion.marks}</div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Weightage</p>
                  </div>
                </div>

                <div className="flex-1 text-lg md:text-xl text-slate-800 leading-relaxed font-medium mb-10 whitespace-pre-wrap">
                  {currentQuestion.text}
                </div>

                <div className="space-y-3">
                  {currentQuestion.type !== QuestionType.NAT ? (
                    currentQuestion.options?.map((opt, i) => {
                      const isSelected = Array.isArray(uAns) ? uAns.includes(i.toString()) : uAns === i.toString();
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (currentQuestion.type === QuestionType.MSQ) {
                              const current = Array.isArray(uAns) ? uAns : [];
                              const next = isSelected ? current.filter(id => id !== i.toString()) : [...current, i.toString()];
                              setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: { questionId: currentQuestion.id, answer: next, status: QuestionStatus.ANSWERED } }));
                            } else {
                              setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: { questionId: currentQuestion.id, answer: i.toString(), status: QuestionStatus.ANSWERED } }));
                            }
                          }}
                          className={`w-full text-left p-5 rounded-3xl border-2 transition-all flex items-center gap-4 ${isSelected ? 'border-blue-600 bg-blue-50 shadow-inner' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center text-sm font-black ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="font-semibold text-slate-700">{opt}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Numerical Answer Entry</label>
                      <input 
                        type="text"
                        value={uAns as string}
                        placeholder="Type answer..."
                        onChange={e => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: { questionId: currentQuestion.id, answer: e.target.value, status: QuestionStatus.ANSWERED } }))}
                        className="w-full md:w-80 p-6 bg-white border-2 border-slate-200 rounded-2xl text-3xl font-mono focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Controls */}
              <div className="flex items-center justify-between gap-4 sticky bottom-4">
                <div className="flex gap-2">
                   <button onClick={() => setIsPaletteOpen(true)} className="md:hidden bg-white p-4 rounded-2xl shadow-xl border border-slate-200 text-slate-900"><Menu size={24} /></button>
                   <button 
                     onClick={() => {
                        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: { ...prev[currentQuestion.id], status: QuestionStatus.MARKED_FOR_REVIEW } }));
                        if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
                     }}
                     className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg shadow-purple-500/20"
                    >
                      <Flag size={24} />
                    </button>
                </div>
                <div className="flex gap-2">
                  <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)} className="bg-white p-4 rounded-2xl border border-slate-200 disabled:opacity-30"><ChevronLeft size={24} /></button>
                  <button 
                    disabled={currentIndex === questions.length - 1} 
                    onClick={() => setCurrentIndex(prev => prev + 1)} 
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-400"
                  >
                    Save & Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <QuestionPalette 
          questionsCount={questions.length} 
          userAnswers={userAnswers} 
          currentIndex={currentIndex} 
          onSelect={idx => setCurrentIndex(idx)} 
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
        />
      </main>

      <footer className="bg-slate-900 text-white px-6 md:px-12 py-5 flex items-center justify-between border-t border-slate-800">
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
           <div>Attempted: <span className="text-white">{Object.keys(userAnswers).length}/{questions.length}</span></div>
           <div>Marks Potential: <span className="text-white">{Object.entries(userAnswers).reduce((a, [id, v]) => a + (questions.find(q=>q.id===parseInt(id))?.marks || 0), 0)} Marks</span></div>
        </div>
        <button 
          onClick={submitExam}
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Final Submit</>}
        </button>
      </footer>

      {showCalc && <ScientificCalculator onClose={() => setShowCalc(false)} />}
      
      {loading && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center text-white p-12">
          <div className="relative mb-12">
            <div className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <BrainCircuit className="absolute inset-0 m-auto text-blue-400" size={40} />
          </div>
          <h2 className="text-4xl font-black mb-4 italic tracking-tighter uppercase">{loadingMsg ? "Syncing AI" : "Generating Test"}</h2>
          <p className="text-slate-400 font-bold max-w-lg text-center leading-relaxed tracking-wide">{loadingMsg || "Coordinating distributed AI threads for fresh questions..."}</p>
          <div className="mt-12 w-80 h-1.5 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 animate-loading-bar"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
