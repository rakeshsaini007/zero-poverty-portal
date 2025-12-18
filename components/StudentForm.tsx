
import React, { useState, useEffect } from 'react';
import { StudentData, EnrollmentStatus, INELIGIBLE_REASONS, SchoolType } from '../types';
import { User, ShieldCheck, MapPin, Phone, Calendar, Hash, ChevronRight, CheckCircle2, AlertCircle, Bookmark } from 'lucide-react';

interface StudentFormProps {
  student: StudentData;
  onUpdate: (updatedData: Partial<StudentData>) => Promise<void>;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onUpdate }) => {
  const isExisting = !!(student.ineligibleReason || student.alreadyEnrolled || student.newlyEnrolled);

  const [status, setStatus] = useState<EnrollmentStatus | null>(
    student.ineligibleReason ? EnrollmentStatus.INELIGIBLE :
    student.alreadyEnrolled ? EnrollmentStatus.ALREADY_ENROLLED :
    student.newlyEnrolled ? EnrollmentStatus.NEWLY_ENROLLED : null
  );
  
  const [subField, setSubField] = useState<string>(student.ineligibleReason || '');
  const [schoolType, setSchoolType] = useState<SchoolType>((student.prevSchoolType || student.newSchoolType || '') as SchoolType);
  const [scholarNo, setScholarNo] = useState<string>(student.prevScholarNo || student.newScholarNo || '');
  const [udiseCode, setUdiseCode] = useState<string>(student.prevUdiseCode || student.newUdiseCode || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student.ineligibleReason) {
      setStatus(EnrollmentStatus.INELIGIBLE);
      setSubField(student.ineligibleReason);
    } else if (student.alreadyEnrolled) {
      setStatus(EnrollmentStatus.ALREADY_ENROLLED);
      setSchoolType(student.prevSchoolType as SchoolType);
      setScholarNo(student.prevScholarNo);
      setUdiseCode(student.prevUdiseCode);
    } else if (student.newlyEnrolled) {
      setStatus(EnrollmentStatus.NEWLY_ENROLLED);
      setSchoolType(student.newSchoolType as SchoolType);
      setScholarNo(student.newScholarNo);
      setUdiseCode(student.newUdiseCode);
    }
  }, [student]);

  const handleSave = async () => {
    if (!status) return;

    // Validation
    if ((status === EnrollmentStatus.ALREADY_ENROLLED || status === EnrollmentStatus.NEWLY_ENROLLED)) {
      if (!scholarNo.trim()) {
        alert('कृपया स्कॉलर रजिस्टर नंबर दर्ज करें।');
        return;
      }
      if (!/^0\d{10}$/.test(udiseCode)) {
        alert('विद्यालय का यूडायस कोड 11 अंकों का होना चाहिए और 0 से शुरू होना चाहिए।');
        return;
      }
      if (!schoolType) {
        alert('कृपया विद्यालय का प्रकार चुनें।');
        return;
      }
    }

    if (status === EnrollmentStatus.INELIGIBLE && !subField) {
      alert('कृपया अपात्रता का कारण चुनें।');
      return;
    }

    setLoading(true);
    const updatePayload: Partial<StudentData> = {
      rowIndex: student.rowIndex,
      ineligibleReason: status === EnrollmentStatus.INELIGIBLE ? subField : '',
      alreadyEnrolled: status === EnrollmentStatus.ALREADY_ENROLLED ? 'Yes' : '',
      prevSchoolType: status === EnrollmentStatus.ALREADY_ENROLLED ? schoolType : '',
      prevScholarNo: status === EnrollmentStatus.ALREADY_ENROLLED ? scholarNo : '',
      prevUdiseCode: status === EnrollmentStatus.ALREADY_ENROLLED ? udiseCode : '',
      newlyEnrolled: status === EnrollmentStatus.NEWLY_ENROLLED ? 'Yes' : '',
      newSchoolType: status === EnrollmentStatus.NEWLY_ENROLLED ? schoolType : '',
      newScholarNo: status === EnrollmentStatus.NEWLY_ENROLLED ? scholarNo : '',
      newUdiseCode: status === EnrollmentStatus.NEWLY_ENROLLED ? udiseCode : '',
    };

    await onUpdate(updatePayload);
    setLoading(false);
  };

  const getStatusColor = (s: EnrollmentStatus) => {
    switch(s) {
      case EnrollmentStatus.INELIGIBLE: return 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100';
      case EnrollmentStatus.ALREADY_ENROLLED: return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
      case EnrollmentStatus.NEWLY_ENROLLED: return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100';
      default: return '';
    }
  };

  const getActiveStatusColor = (s: EnrollmentStatus) => {
    switch(s) {
      case EnrollmentStatus.INELIGIBLE: return 'bg-rose-600 border-rose-600 text-white shadow-rose-200';
      case EnrollmentStatus.ALREADY_ENROLLED: return 'bg-amber-600 border-amber-600 text-white shadow-amber-200';
      case EnrollmentStatus.NEWLY_ENROLLED: return 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200';
      default: return '';
    }
  };

  return (
    <div className={`group relative bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden ${isExisting ? 'ring-2 ring-emerald-500/20' : ''}`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-500 ${isExisting ? 'bg-emerald-500' : 'bg-indigo-500'}`} />

      <div className={`px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isExisting ? 'bg-emerald-50/30' : 'bg-slate-50/50'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${isExisting ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-indigo-600'}`}>
            <User size={24} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {student.studentName || 'Unknown Student'}
              {isExisting && <CheckCircle2 size={18} className="text-emerald-500" />}
            </h3>
            <div className="flex items-center gap-3 mt-1">
               <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <Hash size={12} /> {student.familyId}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <Calendar size={12} /> {student.age} YRS
              </span>
            </div>
          </div>
        </div>

        {isExisting && (
          <div className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-tighter rounded-full shadow-lg shadow-emerald-200 animate-pulse">
            Verified Record
          </div>
        )}
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck size={12} /> Father's Name
            </p>
            <p className="text-sm font-semibold text-slate-700">{student.fatherName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle size={12} /> Aadhaar No
            </p>
            <p className="text-sm font-semibold text-slate-700">•••• •••• {student.aadhaar.slice(-4)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Phone size={12} /> Contact
            </p>
            <p className="text-sm font-semibold text-slate-700">{student.mobile}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={12} /> Portal ID
            </p>
            <p className="text-sm font-semibold text-slate-700">{student.zeroPovertyId}</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Select Enrollment Status</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                EnrollmentStatus.INELIGIBLE,
                EnrollmentStatus.ALREADY_ENROLLED,
                EnrollmentStatus.NEWLY_ENROLLED
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold border-2 transition-all duration-300 text-center flex items-center justify-center gap-2 ${
                    status === s
                      ? `${getActiveStatusColor(s)} shadow-lg scale-[1.02]`
                      : `${getStatusColor(s as EnrollmentStatus)} border-transparent grayscale-[0.5]`
                  }`}
                >
                  {status === s && <CheckCircle2 size={14} />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[80px] transition-all duration-500">
            {status === EnrollmentStatus.INELIGIBLE && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Reason for Ineligibility</label>
                <div className="relative">
                  <select
                    value={subField}
                    onChange={(e) => setSubField(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm rounded-2xl focus:ring-rose-500 focus:border-rose-500 block p-4 outline-none appearance-none transition-all"
                  >
                    <option value="">-- Select Reason --</option>
                    {INELIGIBLE_REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {(status === EnrollmentStatus.ALREADY_ENROLLED || status === EnrollmentStatus.NEWLY_ENROLLED) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">School Type</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value as SchoolType)}
                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm rounded-2xl focus:ring-indigo-500 focus:border-indigo-500 block p-4 outline-none appearance-none transition-all"
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Government">Government School</option>
                    <option value="Private">Private Institution</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Scholar Register Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Bookmark size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter Number"
                      value={scholarNo}
                      onChange={(e) => setScholarNo(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm rounded-2xl focus:ring-indigo-500 focus:border-indigo-500 block p-4 pl-12 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Udise Code (11 Digits)</label>
                  <input
                    type="text"
                    placeholder="e.g. 09050304704"
                    value={udiseCode}
                    maxLength={11}
                    onChange={(e) => setUdiseCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm font-mono tracking-wider rounded-2xl focus:ring-indigo-500 focus:border-indigo-500 block p-4 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}
          </div>

          {status && (
            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`relative group/btn overflow-hidden w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl ${
                  isExisting 
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isExisting ? 'Update Record' : 'Submit Data'}
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
