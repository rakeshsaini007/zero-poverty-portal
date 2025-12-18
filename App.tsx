
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StudentData } from './types';
import { fetchAllData, fetchGramPanchayats, updateStudent } from './services/api';
import StudentForm from './components/StudentForm';
import { MapPin, Search, School, Layers, CheckCircle, AlertTriangle, X, ChevronDown, Activity } from 'lucide-react';

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
      addToast(`Student data synchronized successfully!`);
    } else {
      addToast('Sync failed. Please verify sheet access.', 'error');
    }
  };

  return (
    <div className="min-h-screen selection:bg-indigo-600 selection:text-white pb-20 sm:pb-40">
      {/* Premium Toast System - Responsive Placement */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-8 sm:right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 sm:gap-4 min-w-full sm:min-w-[340px] px-5 py-4 sm:px-8 sm:py-5 rounded-2xl sm:rounded-3xl glass shadow-2xl border-l-4 animate-in slide-in-from-right-10 sm:slide-in-from-right-20 duration-500 ${
              toast.type === 'success' ? 'border-emerald-500 bg-emerald-950/95 text-emerald-100' : 'border-rose-500 bg-rose-950/95 text-rose-100'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="text-emerald-400 shrink-0" size={20} /> : <AlertTriangle className="text-rose-400 shrink-0" size={20} />}
            <p className="text-[11px] sm:text-xs font-black flex-1 uppercase tracking-wider leading-tight">{toast.message}</p>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Deep Glass Navigation - Fully Responsive Stack */}
      <header className="sticky top-0 z-[60] glass-nav mb-6 sm:mb-12 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-2xl sm:rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-indigo-500/30 text-white transform hover:rotate-6 transition-transform">
                <School size={24} className="sm:hidden" />
                <School size={32} className="hidden sm:block" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-[900] text-white tracking-tighter uppercase leading-none">Elite Portal</h1>
                <div className="flex items-center gap-2 mt-1 sm:mt-2">
                   <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Edu Management System</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
              {/* High Contrast GP Selector */}
              <div className="relative group w-full sm:min-w-[240px] lg:min-w-[280px]">
                <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                  <MapPin size={18} />
                </div>
                <select
                  value={selectedPanchayat}
                  disabled={loadingGPs}
                  onChange={(e) => {
                    setSelectedPanchayat(e.target.value);
                    setSearchQuery('');
                  }}
                  className="w-full bg-slate-800/80 border-2 border-slate-700 hover:border-slate-500 focus:border-indigo-500 text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-[1.5rem] py-3.5 sm:py-5 pl-11 sm:pl-14 pr-10 outline-none transition-all appearance-none cursor-pointer uppercase tracking-widest"
                >
                  <option value="">{loadingGPs ? 'Initializing...' : 'Select Gram Panchayat'}</option>
                  {gramPanchayats.map(gp => <option key={gp} value={gp}>{gp}</option>)}
                </select>
                <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                   <ChevronDown size={18} />
                </div>
              </div>

              {/* High Contrast Search */}
              {selectedPanchayat && (
                <div className="relative group w-full lg:flex-1 lg:min-w-[320px]">
                  <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                    <Search size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search by ID or Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/80 border-2 border-slate-700 hover:border-slate-500 focus:border-indigo-500 text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-[1.5rem] py-3.5 sm:py-5 pl-11 sm:pl-16 pr-5 outline-none transition-all placeholder:text-slate-500 uppercase tracking-widest"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8">
        {!selectedPanchayat ? (
          <div className="py-20 sm:py-32 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="relative mb-10 sm:mb-16">
               <div className="absolute inset-0 bg-indigo-500 blur-[80px] sm:blur-[120px] opacity-20 animate-pulse" />
               <div className="relative w-24 h-24 sm:w-40 sm:h-40 bg-slate-900 rounded-3xl sm:rounded-[3rem] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)] border border-slate-700 flex items-center justify-center transform hover:scale-110 transition-transform duration-700">
                  <Layers size={32} className="sm:hidden text-indigo-500" />
                  <Layers size={64} className="hidden sm:block text-indigo-500" />
               </div>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6 tracking-tighter uppercase italic">System Standby</h2>
            <p className="text-slate-400 max-w-md sm:max-w-lg mx-auto leading-relaxed font-bold text-sm sm:text-lg px-4">
              Authorized access required. Please select a <span className="text-white">Gram Panchayat</span> from the command center to retrieve archives.
            </p>
          </div>
        ) : loadingStudents ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-40 space-y-6 sm:space-y-10">
            <div className="relative">
               <div className="w-16 h-16 sm:w-24 sm:h-24 border-4 sm:border-8 border-slate-800 rounded-full" />
               <div className="absolute inset-0 w-16 h-16 sm:w-24 sm:h-24 border-4 sm:border-8 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] sm:text-xs mb-2">Fetching Secure Database</p>
              <p className="text-slate-500 font-bold text-xs sm:text-sm">{selectedPanchayat}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-slate-800">
              <div className="space-y-1 sm:space-y-2">
                 <p className="text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] sm:tracking-[0.5em]">Current Location</p>
                 <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase truncate max-w-full">
                  {selectedPanchayat}
                </h2>
              </div>
              <div className="flex items-center gap-4 justify-between md:justify-end">
                 <div className="flex flex-col items-end">
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Database Stats</p>
                    <p className="text-xl sm:text-2xl font-black text-white">{filteredStudents.length} <span className="text-slate-600 text-xs sm:text-sm">RECORDS</span></p>
                 </div>
                 <div className="p-3 sm:p-4 bg-slate-800 rounded-xl sm:rounded-2xl text-emerald-400 shadow-xl">
                    <Activity size={20} className="sm:hidden" />
                    <Activity size={24} className="hidden sm:block" />
                 </div>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl sm:rounded-[4rem] py-20 sm:py-40 flex flex-col items-center justify-center text-slate-700 animate-in fade-in duration-500 px-6 text-center">
                <div className="p-6 sm:p-8 bg-slate-800/30 rounded-full mb-6 sm:mb-8">
                  <Search size={48} className="sm:hidden opacity-20" />
                  <Search size={64} className="hidden sm:block opacity-20" />
                </div>
                <p className="font-black text-lg sm:text-xl uppercase tracking-tighter">Zero results in this sector</p>
                <p className="text-slate-600 font-bold mt-2 text-sm sm:text-base">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:gap-12">
                {filteredStudents.map((student, idx) => (
                  <div 
                    key={`${student.rowIndex}-${student.aadhaar}`} 
                    className="animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-12 duration-700" 
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
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
    </div>
  );
};

export default App;
