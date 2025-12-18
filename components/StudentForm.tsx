
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
        return status === s ? 'bg-rose-600 border-rose-600 text-white shadow-rose-200' : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100';
      case EnrollmentStatus.ALREADY_ENROLLED: 
        return status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100';
      case EnrollmentStatus.NEWLY_ENROLLED: 
        return status === s ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200' : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100';
      default: return '';
    }
  };

  return (
    <div className={`premium-card relative border-2 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 ${isExisting ? 'border-emerald-500/30' : 'border-slate-200'}`}>
      
      {/* High Contrast Header */}
      <div className={`px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isExisting ? 'bg-emerald-500/5' : 'bg-slate-50/50'}`}>
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl ${isExisting ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
            <User size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {student.studentName}
              </h3>
              {isExisting && (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700 text-xs font-bold">
                  <Hash size={14} className="text-indigo-500" />
                  ID: <span className="text-indigo-700">{student.familyId}</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700 text-xs font-bold">
                  <Calendar size={14} className="text-indigo-500" />
                  Age: <span className="text-indigo-700">{student.age} yrs</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status Summary</p>
           <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${isExisting ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
              {status ? status.split(' ').slice(-2).join(' ') : 'Pending Review'}
           </div>
        </div>
      </div>

      <div className="p-10">
        {/* High Contrast Info Power Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="group/item">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-500" /> Guardian
            </p>
            <p className="text-sm font-extrabold text-slate-950 group-hover/item:text-indigo-600 transition-colors">{student.fatherName}</p>
          </div>
          <div className="group/item">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertCircle size={14} className="text-indigo-500" /> Aadhaar No
            </p>
            <p className="text-sm font-extrabold text-slate-950 tracking-widest">•••• •••• {student.aadhaar.slice(-4)}</p>
          </div>
          <div className="group/item">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Phone size={14} className="text-indigo-500" /> Mobile
            </p>
            <p className="text-sm font-extrabold text-slate-950">{student.mobile}</p>
          </div>
          <div className="group/item">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-indigo-500" /> Zero Poverty ID
            </p>
            <p className="text-sm font-extrabold text-slate-950">{student.zeroPovertyId}</p>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <p className="text-xs font-black text-slate-800 mb-5 uppercase tracking-widest flex items-center gap-2">
              <Star size={16} className="text-amber-500 fill-amber-500" /> Update Enrollment Status
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                EnrollmentStatus.INELIGIBLE,
                EnrollmentStatus.ALREADY_ENROLLED,
                EnrollmentStatus.NEWLY_ENROLLED
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-6 py-5 rounded-[1.5rem] text-[11px] font-black border-2 transition-all duration-300 text-center flex items-center justify-center gap-3 uppercase tracking-wider ${getStatusStyle(s)}`}
                >
                  {status === s && <CheckCircle2 size={18} className="animate-in zoom-in duration-300" />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[100px] bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100">
            {status === EnrollmentStatus.INELIGIBLE && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="block text-xs font-black text-slate-800 mb-4 uppercase tracking-wider">Select Specific Reason for Ineligibility</label>
                <select
                  value={subField}
                  onChange={(e) => setSubField(e.target.value)}
                  className="w-full input-dark rounded-2xl text-sm font-bold block p-5 outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Ineligibility Reason --</option>
                  {INELIGIBLE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            {(status === EnrollmentStatus.ALREADY_ENROLLED || status === EnrollmentStatus.NEWLY_ENROLLED) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">School Type</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value as SchoolType)}
                    className="w-full input-dark rounded-2xl text-sm font-bold block p-5 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">-- Select School Type --</option>
                    <option value="Government">Government School</option>
                    <option value="Private">Private Institution</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">Scholar Register Number</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Bookmark size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter Reg. Number"
                      value={scholarNo}
                      onChange={(e) => setScholarNo(e.target.value)}
                      className="w-full input-dark rounded-2xl text-sm font-bold block p-5 pl-14 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">UDISE Code (11 Digits)</label>
                  <div className="relative">
                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                      <GraduationCap size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 09050304704"
                      value={udiseCode}
                      maxLength={11}
                      onChange={(e) => setUdiseCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full input-dark rounded-2xl text-sm font-mono font-bold tracking-widest block p-5 pl-14 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {!status && (
              <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                 <AlertCircle size={32} className="mb-2 opacity-20" />
                 <p className="text-xs font-bold uppercase tracking-widest">Select a status above to proceed</p>
              </div>
            )}
          </div>

          {status && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`relative overflow-hidden group/save w-full sm:w-auto px-12 py-5 rounded-[1.8rem] font-black text-[13px] uppercase tracking-[0.15em] text-white transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl ${
                  isExisting 
                    ? 'bg-slate-900 hover:bg-black shadow-slate-300' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-300'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isExisting ? 'Update Final Record' : 'Submit Enrollment Data'}
                      <ChevronRight size={20} className="group-hover/save:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/save:translate-x-full transition-transform duration-1000" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
