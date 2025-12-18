
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StudentData } from './types';
import { fetchAllData, fetchGramPanchayats, updateStudent } from './services/api';
import StudentForm from './components/StudentForm';
import { MapPin, Search, School, Layers, CheckCircle, AlertTriangle, X, ChevronDown, Activity, Menu } from 'lucide-react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      setIsMenuOpen(false); // Close menu after selection on mobile
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
      addToast(`Record updated successfully!`);
    } else {
      addToast('Update failed. Check connection.', 'error');
    }
  };

  return (
    <div className="min-h-screen selection:bg-indigo-600 selection:text-white pb-10 sm:pb-20">
      {/* Notifications */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-8 sm:right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl glass shadow-2xl border-l-4 animate-in slide-in-from-top-5 sm:slide-in-from-right-10 duration-500 ${
              toast.type === 'success' ? 'border-emerald-500 bg-emerald-950/95 text-emerald-100' : 'border-rose-500 bg-rose-950/95 text-rose-100'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="text-emerald-400 shrink-0" size={20} /> : <AlertTriangle className="text-rose-400 shrink-0" size={20} />}
            <p className="text-[11px] font-black uppercase tracking-wider leading-tight">{toast.message}</p>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Header with Hamburger */}
      <header className="sticky top-0 z-[60] glass-nav py-4 sm:py-6 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shadow-lg text-white">
                <School size={24} className="sm:hidden" />
                <School size={30} className="hidden sm:block" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tighter uppercase leading-none">Zero Poverty Portal</h1>
                <p className="text-[7px] sm:text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Authorized Access</p>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-6 flex-1 max-w-3xl ml-10">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={selectedPanchayat}
                  onChange={(e) => setSelectedPanchayat(e.target.value)}
                  className="w-full bg-slate-800/80 border-2 border-slate-700 text-white text-xs font-black rounded-xl py-3.5 pl-12 pr-10 outline-none appearance-none cursor-pointer uppercase tracking-widest focus:border-indigo-500"
                >
                  <option value="">{loadingGPs ? 'Loading...' : 'Select Gram Panchayat'}</option>
                  {gramPanchayats.map(gp => <option key={gp} value={gp}>{gp}</option>)}
                </select>
                {/* Fixed incorrect casing for ChevronDown component below */}
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              </div>
              
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/80 border-2 border-slate-700 text-white text-xs font-black rounded-xl py-3.5 pl-12 pr-4 outline-none placeholder:text-slate-500 uppercase tracking-widest focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 bg-slate-800 border-2 border-slate-700 text-white rounded-xl shadow-lg active:scale-90 transition-all hover:bg-slate-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-slate-900/98 backdrop-blur-2xl border-b border-slate-800 p-6 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Gram Panchayat</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={selectedPanchayat}
                    onChange={(e) => setSelectedPanchayat(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-700 text-white text-xs font-black rounded-xl py-4 pl-12 pr-10 outline-none appearance-none uppercase tracking-widest"
                  >
                    <option value="">Select Gram Panchayat</option>
                    {gramPanchayats.map(gp => <option key={gp} value={gp}>{gp}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Filter Records</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-700 text-white text-xs font-black rounded-xl py-4 pl-12 pr-4 outline-none uppercase tracking-widest"
                  />
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors shadow-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-6 sm:mt-12">
        {!selectedPanchayat ? (
          <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-10">
               <div className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-20 animate-pulse" />
               <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-slate-900 rounded-[2rem] border border-slate-700 flex items-center justify-center shadow-2xl">
                  <Layers size={40} className="text-indigo-500" />
               </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic">System Ready</h2>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-bold text-sm">
              Please select a <span className="text-indigo-400 font-black">Gram Panchayat</span> from the control center to retrieve student archives.
            </p>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="mt-8 lg:hidden flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-indigo-700"
            >
              Open Controls <ChevronDown size={16} />
            </button>
          </div>
        ) : loadingStudents ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Loading Database...</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/50">
              <div className="min-w-0">
                 <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">Active Sector</p>
                 <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase truncate">
                  {selectedPanchayat}
                </h2>
              </div>
              <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800 shrink-0">
                 <div className="text-right">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Available</p>
                    <p className="text-xl font-black text-white leading-none">{filteredStudents.length} <span className="text-[10px] text-slate-600">UNITS</span></p>
                 </div>
                 <Activity size={24} className="text-emerald-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-12">
              {filteredStudents.map((student, idx) => (
                <StudentForm 
                  key={`${student.rowIndex}-${student.aadhaar}`}
                  student={student} 
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
