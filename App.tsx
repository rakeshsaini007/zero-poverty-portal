
import React, { useState, useEffect, useMemo } from 'react';
import { StudentData } from './types';
import { fetchAllData, fetchGramPanchayats, updateStudent } from './services/api';
import StudentForm from './components/StudentForm';

const App: React.FC = () => {
  const [gramPanchayats, setGramPanchayats] = useState<string[]>([]);
  const [selectedPanchayat, setSelectedPanchayat] = useState<string>('');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loadingGPs, setLoadingGPs] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load of Gram Panchayats
  useEffect(() => {
    const loadGPs = async () => {
      setLoadingGPs(true);
      const gps = await fetchGramPanchayats();
      setGramPanchayats(gps);
      setLoadingGPs(false);
    };
    loadGPs();
  }, []);

  // Fetch students when Gram Panchayat changes
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
    return students.filter(student => {
      const matchSearch = !searchQuery || 
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.zeroPovertyId.includes(searchQuery);
      return matchSearch;
    });
  }, [students, searchQuery]);

  const handleUpdate = async (updatedData: Partial<StudentData>) => {
    const success = await updateStudent(updatedData);
    if (success) {
      setStudents(prev => prev.map(s => 
        s.rowIndex === updatedData.rowIndex ? { ...s, ...updatedData } : s
      ));
    } else {
      alert('Error updating record. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-indigo-700 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl font-bold">🏫</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Enrollment Portal</h1>
              <p className="text-[10px] text-indigo-100 uppercase font-semibold">Department of Basic Education</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedPanchayat}
                disabled={loadingGPs}
                onChange={(e) => setSelectedPanchayat(e.target.value)}
                className="w-full bg-indigo-800 border-indigo-500 text-white text-sm rounded-lg focus:ring-white focus:border-white block p-2.5 outline-none disabled:opacity-50"
              >
                <option value="">{loadingGPs ? 'लोड हो रहा है...' : '-- ग्राम पंचायत चुनें --'}</option>
                {gramPanchayats.map(gp => (
                  <option key={gp} value={gp}>{gp}</option>
                ))}
              </select>
            </div>
            {selectedPanchayat && (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="नाम से खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-indigo-800 border-indigo-500 text-white text-sm rounded-lg focus:ring-white focus:border-white block w-full md:w-64 p-2.5 pl-10 outline-none placeholder:text-indigo-300"
                />
                <span className="absolute left-3 top-3 text-indigo-300">🔍</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!selectedPanchayat ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-24 flex flex-col items-center justify-center text-slate-400">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
              <span className="text-5xl">🏘️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-600 mb-2">स्वागत है!</h2>
            <p className="text-sm max-w-xs text-center">डाटा देखने के लिए कृपया ऊपर दी गई सूची से ग्राम पंचायत का चयन करें।</p>
          </div>
        ) : loadingStudents ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">{selectedPanchayat} का डाटा लोड किया जा रहा है...</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-indigo-600">📍</span> {selectedPanchayat}
                <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full font-medium">
                  {filteredStudents.length} छात्र
                </span>
              </h2>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-20 flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl mb-2">🔍</span>
                <p>इस पंचायत में कोई छात्र नहीं मिला।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredStudents.map((student) => (
                  <StudentForm 
                    key={`${student.rowIndex}-${student.aadhaar}`} 
                    student={student} 
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 py-3 text-center text-[10px] text-slate-400 font-medium z-40">
        &copy; 2024 Zero Poverty Portal Management System. Strictly for official use.
      </footer>
    </div>
  );
};

export default App;
