
import React, { useState, useEffect } from 'react';
import { StudentData, EnrollmentStatus, INELIGIBLE_REASONS, SchoolType } from '../types';
import { User, ShieldCheck, MapPin, Phone, Calendar, Hash, ChevronRight, CheckCircle2, AlertCircle, Bookmark, Star, GraduationCap } from 'lucide-react';

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

  const getStatusStyle = (s: EnrollmentStatus) => {
    switch(s) {
      case EnrollmentStatus.INELIGIBLE: 
        return status === s ? 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-200' : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100';
      case EnrollmentStatus.ALREADY_ENROLLED: 
        return status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100';
      case EnrollmentStatus.NEWLY_ENROLLED: 
        return status === s ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100';
      default: return '';
    }
  };

  return (
    <div className={`premium-card relative border-2 rounded-3xl sm:rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 overflow-hidden ${isExisting ? 'border-emerald-500/30' : 'border-slate-200'}`}>
      
      {/* High Contrast Responsive Header */}
      <div className={`px-5 py-6 sm:px-10 sm:py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isExisting ? 'bg-emerald-500/5' : 'bg-slate-50/50'}`}>
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl shrink-0 ${isExisting ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
            <User size={24} className="sm:hidden" />
            <User size={32} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
               <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase truncate">
                {student.studentName}
              </h3>
              {isExisting && (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  <CheckCircle2 size={10} /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5 sm:mt-3">
               <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-100 rounded-lg sm:rounded-xl text-slate-700 text-[9px] sm:text-xs font-bold">
                  <Hash size={12} className="text-indigo-500" />
                  ID: <span className="text-indigo-700">{student.familyId}</span>
               </div>
               <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-100 rounded-lg sm:rounded-xl text-slate-700 text-[9px] sm:text-xs font-bold">
                  <Calendar size={12} className="text-indigo-500" />
                  {student.age} yrs
               </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
           <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status Summary</p>
           <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider ${isExisting ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-200 text-slate-600'}`}>
              {status ? status.split(' ').slice(-2).join(' ') : 'Pending'}
           </div>
        </div>
      </div>

      <div className="p-5 sm:p-10">
        {/* High Contrast Info Power Grid - Responsive Columns */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="group/item">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-indigo-500" /> Guardian
            </p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-950 group-hover/item:text-indigo-600 transition-colors truncate">{student.fatherName}</p>
          </div>
          <div className="group/item">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-2">
              <AlertCircle size={12} className="text-indigo-500" /> Aadhaar No
            </p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-950 tracking-widest">•••• •••• {student.aadhaar.slice(-4)}</p>
          </div>
          <div className="group/item">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-2">
              <Phone size={12} className="text-indigo-500" /> Mobile
            </p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-950">{student.mobile}</p>
          </div>
          <div className="group/item">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-2">
              <MapPin size={12} className="text-indigo-500" /> Portal ID
            </p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-950">{student.zeroPovertyId}</p>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-10">
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-800 mb-4 sm:mb-5 uppercase tracking-widest flex items-center gap-2">
              <Star size={14} className="text-amber-500 fill-amber-500" /> Update Enrollment Status
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                EnrollmentStatus.INELIGIBLE,
                EnrollmentStatus.ALREADY_ENROLLED,
                EnrollmentStatus.NEWLY_ENROLLED
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-4 sm:px-6 sm:py-5 rounded-2xl sm:rounded-[1.5rem] text-[10px] sm:text-[11px] font-black border-2 transition-all duration-300 text-center flex items-center justify-center gap-3 uppercase tracking-wider leading-tight ${getStatusStyle(s)}`}
                >
                  {status === s && <CheckCircle2 size={16} className="shrink-0 animate-in zoom-in duration-300" />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[80px] sm:min-h-[100px] bg-slate-50/50 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-slate-100">
            {status === EnrollmentStatus.INELIGIBLE && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="block text-[10px] sm:text-xs font-black text-slate-800 mb-3 sm:mb-4 uppercase tracking-wider">Reason for Ineligibility</label>
                <select
                  value={subField}
                  onChange={(e) => setSubField(e.target.value)}
                  className="w-full input-dark rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold block p-4 sm:p-5 outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Reason --</option>
                  {INELIGIBLE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            {(status === EnrollmentStatus.ALREADY_ENROLLED || status === EnrollmentStatus.NEWLY_ENROLLED) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-wider">School Type</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value as SchoolType)}
                    className="w-full input-dark rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold block p-4 sm:p-5 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">-- Select --</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-wider">Scholar Reg No</label>
                  <div className="relative">
                    <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Bookmark size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Reg Number"
                      value={scholarNo}
                      onChange={(e) => setScholarNo(e.target.value)}
                      className="w-full input-dark rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold block p-4 pl-11 sm:p-5 sm:pl-14 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-wider">UDISE Code</label>
                  <div className="relative">
                     <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400">
                      <GraduationCap size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 0905..."
                      value={udiseCode}
                      maxLength={11}
                      onChange={(e) => setUdiseCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full input-dark rounded-xl sm:rounded-2xl text-xs sm:text-sm font-mono font-bold tracking-widest block p-4 pl-11 sm:p-5 sm:pl-14 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {!status && (
              <div className="flex flex-col items-center justify-center py-2 sm:py-4 text-slate-400">
                 <AlertCircle size={24} className="mb-2 opacity-20" />
                 <p className="text-[10px] font-bold uppercase tracking-widest">Select a status above</p>
              </div>
            )}
          </div>

          {status && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`relative overflow-hidden group/save w-full sm:w-auto px-10 py-4 sm:px-12 sm:py-5 rounded-xl sm:rounded-[1.8rem] font-black text-[11px] sm:text-[13px] uppercase tracking-widest text-white transition-all duration-500 active:scale-95 disabled:opacity-50 shadow-2xl ${
                  isExisting 
                    ? 'bg-slate-900 hover:bg-black' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isExisting ? 'Update' : 'Submit'}
                      <ChevronRight size={18} className="group-hover/save:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
