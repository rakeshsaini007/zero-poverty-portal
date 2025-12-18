
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
      if (!scholarNo.trim()) { alert('कृपया स्कॉलर रजिस्टर नंबर दर्ज करें।'); return; }
      if (!/^0\d{10}$/.test(udiseCode)) { alert('विद्यालय का यूडायस कोड 11 अंकों का होना चाहिए और 0 से शुरू होना चाहिए।'); return; }
      if (!schoolType) { alert('कृपया विद्यालय का प्रकार चुनें।'); return; }
    }
    if (status === EnrollmentStatus.INELIGIBLE && !subField) { alert('कृपया अपात्रता का कारण चुनें।'); return; }

    setLoading(true);
    await onUpdate({
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
    });
    setLoading(false);
  };

  const getStatusStyle = (s: EnrollmentStatus) => {
    switch(s) {
      case EnrollmentStatus.INELIGIBLE: 
        return status === s ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100';
      case EnrollmentStatus.ALREADY_ENROLLED: 
        return status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100';
      case EnrollmentStatus.NEWLY_ENROLLED: 
        return status === s ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100';
      default: return '';
    }
  };

  return (
    <div className={`premium-card relative border-2 rounded-3xl transition-all duration-300 ${isExisting ? 'border-emerald-500/20' : 'border-slate-200 shadow-sm'}`}>
      
      {/* Header - Stacks on Mobile */}
      <div className={`px-5 py-5 sm:px-8 sm:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isExisting ? 'bg-emerald-500/5' : 'bg-slate-50/50'}`}>
        <div className="flex items-center gap-4 w-full">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${isExisting ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
            <User size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
               <h3 className="text-base sm:text-xl font-black text-slate-950 uppercase truncate">
                {student.studentName}
              </h3>
              {isExisting && (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={10} /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
               <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded-lg flex items-center gap-1">
                 <Hash size={10} className="text-indigo-600" /> {student.familyId}
               </span>
               <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded-lg flex items-center gap-1">
                 <Calendar size={10} className="text-indigo-600" /> {student.age} Yrs
               </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex justify-end md:block pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
           <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${isExisting ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {status ? status.split(' ').slice(-2).join(' ') : 'Status Pending'}
           </div>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {/* Info Grid - 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div>
            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-1">
              <ShieldCheck size={10} className="text-indigo-500" /> Father
            </p>
            <p className="text-xs font-black text-slate-950 truncate">{student.fatherName}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-1">
              <AlertCircle size={10} className="text-indigo-500" /> Aadhaar
            </p>
            <p className="text-xs font-black text-slate-950 tracking-widest">••• {student.aadhaar.slice(-4)}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Phone size={10} className="text-indigo-500" /> Mobile
            </p>
            <p className="text-xs font-black text-slate-950">{student.mobile}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-1">
              <MapPin size={10} className="text-indigo-500" /> Portal ID
            </p>
            <p className="text-xs font-black text-slate-950">{student.zeroPovertyId}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
              <Star size={12} className="text-amber-500 fill-amber-500" /> Enrollment Status
            </p>
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-3">
              {[EnrollmentStatus.INELIGIBLE, EnrollmentStatus.ALREADY_ENROLLED, EnrollmentStatus.NEWLY_ENROLLED].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-3 sm:py-4 rounded-xl text-[10px] font-black border-2 transition-all text-center uppercase tracking-wider leading-tight ${getStatusStyle(s)}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[60px] bg-slate-100/50 rounded-2xl p-4 sm:p-6">
            {status === EnrollmentStatus.INELIGIBLE && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-slate-950 mb-3 uppercase tracking-wider">Reason for Ineligibility</label>
                <select
                  value={subField}
                  onChange={(e) => setSubField(e.target.value)}
                  className="w-full input-dark rounded-xl text-xs font-bold block p-4 outline-none cursor-pointer"
                >
                  <option value="">-- Choose Reason --</option>
                  {INELIGIBLE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}

            {(status === EnrollmentStatus.ALREADY_ENROLLED || status === EnrollmentStatus.NEWLY_ENROLLED) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-wider">School Type</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value as SchoolType)}
                    className="w-full input-dark rounded-xl text-xs font-bold block p-4 outline-none"
                  >
                    <option value="">-- Type --</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-wider">Scholar No</label>
                  <div className="relative">
                    <Bookmark size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Reg Number"
                      value={scholarNo}
                      onChange={(e) => setScholarNo(e.target.value)}
                      className="w-full input-dark rounded-xl text-xs font-bold block p-4 pl-11 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-wider">UDISE Code</label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 0905..."
                      value={udiseCode}
                      maxLength={11}
                      onChange={(e) => setUdiseCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full input-dark rounded-xl text-xs font-mono font-bold tracking-widest block p-4 pl-11 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {!status && (
              <div className="flex items-center justify-center py-4 text-slate-500">
                 <p className="text-[10px] font-black uppercase tracking-widest">Status configuration required</p>
              </div>
            )}
          </div>

          {status && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`w-full sm:w-auto px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50 shadow-xl ${
                  isExisting ? 'bg-slate-950' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? 'Processing...' : isExisting ? 'Sync Update' : 'Submit Record'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
