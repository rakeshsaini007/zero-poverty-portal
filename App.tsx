
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StudentData } from './types';
import { fetchAllData, fetchGramPanchayats, updateStudent } from './services/api';
import StudentForm from './components/StudentForm';
import { MapPin, Search, School, Layers, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const App: React.FC = () => {
  const [gramPanchayats, setGramPanchayats] = useState<string[]>([]);
  const [selectedPanchayat, setSelectedPanchayat] = useState<string>('');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loadingGPs, setLoadingGPs] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    const loadGPs = async () => {
      setLoadingGPs(true);
      const gps = await fetchGramPanchayats();
      setGramPanchayats(gps);
      setLoadingGPs(false);
    };
    loadGPs();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedPanchayat) {
        setStudents([]);
        return;
      }
      setLoadingStudents(true);
      const data = await fetchAllData(selectedPanchayat);
      setStudents(data);
      setLoadingStudents(false);
    };
    loadStudents();
  }, [selectedPanchayat]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(student => {
      if (!q) return true;
      const name = (student.studentName || '').toLowerCase();
      const familyId = (student.familyId || '').toLowerCase();
      const portalId = (student.zeroPovertyId || '').toLowerCase();
      const father = (student.fatherName || '').toLowerCase();
      return name.includes(q) || familyId.includes(q) || portalId.includes(q) || father.includes(q);
    });
  }, [students, searchQuery]);

  const handleUpdate = async (updatedData: Partial<StudentData>) => {
    const success = await updateStudent(updatedData);
    if (success) {
      setStudents(prev => prev.map(s => 
        s.rowIndex === updatedData.rowIndex ? { ...s, ...updatedData } : s
      ));
      addToast(`Record for index ${updatedData.rowIndex} saved successfully!`);
    } else {
      addToast('Critical error while saving data. Please check connection.', 'error');
    }
  };

  return (
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      {/* Premium Toast Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 min-w-[300px] px-6 py-4 rounded-2xl glass shadow-2xl animate-in slide-in-from-right-10 duration-500 ${
              toast.type === 'success' ? 'border-emerald-500/20 text-emerald-900' : 'border-rose-500/20 text-rose-900'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="text-emerald-500" size={20} /> : <AlertTriangle className="text-rose-500" size={20} />}
            <p className="text-sm font-bold flex-1">{toast.message}</p>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Glass Navigation */}
      <header className="sticky top-0 z-[60] glass border-b border-slate-200/50 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 text-white">
                <School size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Enrollment</h1>
                <p className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest mt-1">Basic Education Dept.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* GP Selector */}
              <div className="relative group min-w-[240px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <MapPin size={18} />
                </div>
                <select
                  value={selectedPanchayat}
                  disabled={loadingGPs}
                  onChange={(e) => {
                    setSelectedPanchayat(e.target.value);
                    setSearchQuery('');
                  }}
                  className="w-full bg-slate-100/50 hover:bg-white border-2 border-transparent focus:border-indigo-500 focus:bg-white text-slate-900 text-sm font-bold rounded-2xl py-3 pl-12 pr-10 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">{loadingGPs ? 'Initializing...' : 'Select Gram Panchayat'}</option>
                  {gramPanchayats.map(gp => <option key={gp} value={gp}>{gp}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <ChevronRight className="rotate-90" size={16} />
                </div>
              </div>

              {/* Search */}
              {selectedPanchayat && (
                <div className="relative group flex-1 min-w-[280px]">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Search size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search by Name, Family ID or Portal ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-white border-2 border-transparent focus:border-indigo-500 focus:bg-white text-slate-900 text-sm font-bold rounded-2xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {!selectedPanchayat ? (
          <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-12">
               <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-10 animate-pulse" />
               <div className="relative w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center justify-center">
                  <Layers size={48} className="text-indigo-600" />
               </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Ready to manage records</h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">Please select a Gram Panchayat from the top menu to view and process student enrollment data.</p>
          </div>
        ) : loadingStudents ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
               <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
               <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Processing Database for {selectedPanchayat}...</p>
          </div>
        ) : (
          <div className="pb-32 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><MapPin size={20} /></span>
                {selectedPanchayat}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 Results found: <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs">{filteredStudents.length}</span>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-32 flex flex-col items-center justify-center text-slate-300">
                <Search size={48} className="mb-4 opacity-50" />
                <p className="font-bold text-slate-400">No matching records discovered.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {filteredStudents.map((student, idx) => (
                  <div key={`${student.rowIndex}-${student.aadhaar}`} className="animate-in fade-in slide-in-from-bottom-10" style={{ animationDelay: `${idx * 50}ms` }}>
                    <StudentForm 
                      student={student} 
                      onUpdate={handleUpdate}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 right-0 py-6 pointer-events-none z-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="glass px-8 py-3 rounded-2xl inline-flex items-center gap-3 border border-indigo-500/10 shadow-xl pointer-events-auto mx-auto left-1/2 -translate-x-1/2 relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Systems Operational • 2024 Secure Portal</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

// Internal icon proxy for ChevronRight since it's used in App but not imported there in previous blocks
const ChevronRight = ({ size, className, rotate }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`${className} ${rotate ? rotate : ''}`}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default App;
