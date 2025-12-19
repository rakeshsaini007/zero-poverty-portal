
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
  const [customOtherReason, setCustomOtherReason] = useState<string>('');
  const [schoolType, setSchoolType] = useState<SchoolType>((student.prevSchoolType || student.newSchoolType || '') as SchoolType);
  const [scholarNo, setScholarNo] = useState<string>(student.prevScholarNo || student.newScholarNo || '');
  const [udiseCode, setUdiseCode] = useState<string>(student.prevUdiseCode || student.newUdiseCode || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student.ineligibleReason) {
      setStatus(EnrollmentStatus.INELIGIBLE);
      // Check if it's a standard reason or custom
      if (INELIGIBLE_REASONS.includes(student.ineligibleReason)) {
        setSubField(student.ineligibleReason);
        setCustomOtherReason('');
      } else {
        setSubField("अन्य");
        setCustomOtherReason(student.ineligibleReason);
      }
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
      if (!scholarNo.trim()) { alert('कृपया स्कॉलर रजिस्टर नंबर दर्ज करें।'); return; }
      if (!/^0\d{10}$/.test(udiseCode)) { alert('विद्यालय का यूडायस कोड 11 अंकों का होना चाहिए और 0 से शुरू होना चाहिए।'); return; }
      if (!schoolType) { alert('कृपया विद्यालय का प्रकार चुनें।'); return; }
    }
    
    if (status === EnrollmentStatus.INELIGIBLE) {
      if (!subField) { alert('कृपया अपात्रता का कारण चुनें।'); return; }
      if (subField === "अन्य" && !customOtherReason.trim()) { alert('कृपया अन्य कारण का विवरण लिखें।'); return; }
    }

    const finalIneligibleReason = (status === EnrollmentStatus.INELIGIBLE && subField === "अन्य") 
      ? customOtherReason.trim() 
      : subField;

    setLoading(true);
    await onUpdate({
      rowIndex: student.rowIndex,
      ineligibleReason: status === EnrollmentStatus.INELIGIBLE ? finalIneligibleReason : '',
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
        return status === s ? 'bg-rose-600 border-rose-600 text-white shadow-xl' : 'bg-rose-50 border-rose-400 text-rose-800 hover:bg-rose-100';
      case EnrollmentStatus.ALREADY_ENROLLED: 
        return status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-indigo-50 border-indigo-400 text-indigo-800 hover:bg-indigo-100';
      case EnrollmentStatus.NEWLY_ENROLLED: 
        return status === s ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl' : 'bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100';
      default: return '';
    }
  };

  return (
    <div className={`premium-card relative border-2 rounded-3xl transition-all duration-300 overflow-hidden ${isExisting ? 'border-emerald-500/30 shadow-emerald-900/10' : 'border-slate-900 shadow-xl'}`}>
      
      {/* Header */}
      <div className={`px-5 py-6 sm:px-10 sm:py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isExisting ? 'bg-emerald-50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-6 w-full">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${isExisting ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
            <User size={30} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
               <h3 className="text-xl sm:text-3xl font-black text-slate-950 uppercase truncate leading-tight">
                {student.studentName}
              </h3>
              {isExisting && (
                <span className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
               <span className="px-3 py-1 border border-slate-300 bg-white text-slate-900 text-[11px] font-black rounded-lg flex items-center gap-1.5">
                 <Hash size={12} className="text-indigo-600" /> {student.familyId}
               </span>
               <span className="px-3 py-1 border border-slate-300 bg-white text-slate-900 text-[11px] font-black rounded-lg flex items-center gap-1.5">
                 <Calendar size={12} className="text-indigo-600" /> {student.age} Yrs
               </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex justify-end md:block pt-4 md:pt-0 border-t md:border-t-0 border-slate-200">
           <div className={`px-5 py-3 rounded-xl text-base font-black tracking-wider shadow-sm border text-center ${isExisting ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-900 text-white border-slate-950'}`}>
              {status ? status : 'Status Pending'}
           </div>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        {/* Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10">
          <div>
            <p className="text-[11px] font-black text-slate-950 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-600" /> Father's Name
            </p>
            <p className="text-sm font-black text-slate-950 truncate border-b border-slate-200 pb-2">{student.fatherName}</p>
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-950 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertCircle size={14} className="text-indigo-600" /> Aadhaar No.
            </p>
            <p className="text-sm font-black text-slate-950 tracking-widest border-b border-slate-200 pb-2">•••• •••• {student.aadhaar.slice(-4)}</p>
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-950 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Phone size={14} className="text-indigo-600" /> Mobile No.
            </p>
            <p className="text-sm font-black text-slate-950 border-b border-slate-200 pb-2">{student.mobile}</p>
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-950 uppercase tracking-widest mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-indigo-600" /> Portal ID
            </p>
            <p className="text-sm font-black text-slate-950 border-b border-slate-200 pb-2">{student.zeroPovertyId}</p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-5">
            <p className="text-[14px] font-black text-slate-950 uppercase tracking-[0.1em] flex items-center gap-2">
              <Star size={18} className="text-indigo-600 fill-indigo-600" /> Update Enrollment Status
            </p>
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-5">
              {[EnrollmentStatus.INELIGIBLE, EnrollmentStatus.ALREADY_ENROLLED, EnrollmentStatus.NEWLY_ENROLLED].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-6 py-6 rounded-xl text-lg font-black border-2 transition-all text-center tracking-tight leading-snug shadow-sm active:scale-95 ${getStatusStyle(s)}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[100px] bg-slate-100 rounded-2xl p-6 sm:p-10 border-2 border-slate-900 shadow-inner">
            {status === EnrollmentStatus.INELIGIBLE && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-5">
                <div>
                  <label className="block text-[14px] font-black text-slate-950 mb-5 uppercase tracking-wider">अपात्रता का कारण चुनें</label>
                  <select
                    value={subField}
                    onChange={(e) => setSubField(e.target.value)}
                    className="w-full input-dark rounded-xl text-lg font-bold block p-6 outline-none cursor-pointer border-2 border-slate-950"
                  >
                    <option value="">-- चुनें --</option>
                    {INELIGIBLE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {subField === "अन्य" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[13px] font-black text-slate-950 mb-3 uppercase tracking-wider">कृपया कारण लिखें</label>
                    <input
                      type="text"
                      placeholder="अन्य कारण दर्ज करें..."
                      value={customOtherReason}
                      onChange={(e) => setCustomOtherReason(e.target.value)}
                      className="w-full input-dark rounded-xl text-lg font-bold block p-6 outline-none border-2 border-slate-950"
                    />
                  </div>
                )}
              </div>
            )}

            {(status === EnrollmentStatus.ALREADY_ENROLLED || status === EnrollmentStatus.NEWLY_ENROLLED) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <label className="text-[13px] font-black text-slate-950 uppercase tracking-wider">विद्यालय का प्रकार</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value as SchoolType)}
                    className="w-full input-dark rounded-xl text-base font-bold block p-5 outline-none border-2 border-slate-950"
                  >
                    <option value="">-- चुनें --</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[13px] font-black text-slate-950 uppercase tracking-wider">स्कॉलर रजिस्टर नंबर</label>
                  <div className="relative">
                    <Bookmark size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900" />
                    <input
                      type="text"
                      placeholder="SR Number"
                      value={scholarNo}
                      onChange={(e) => setScholarNo(e.target.value)}
                      className="w-full input-dark rounded-xl text-base font-bold block p-5 pl-12 outline-none border-2 border-slate-950"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[13px] font-black text-slate-950 uppercase tracking-wider">विद्यालय का यूडायस कोड</label>
                  <div className="relative">
                    <GraduationCap size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900" />
                    <input
                      type="text"
                      placeholder="0905..."
                      value={udiseCode}
                      maxLength={11}
                      onChange={(e) => setUdiseCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full input-dark rounded-xl text-base font-mono font-bold tracking-widest block p-5 pl-12 outline-none border-2 border-slate-950"
                    />
                  </div>
                </div>
              </div>
            )}

            {!status && (
              <div className="flex flex-col items-center justify-center py-6 text-slate-600">
                 <AlertCircle size={32} className="mb-3 opacity-30" />
                 <p className="text-[13px] font-black uppercase tracking-widest">Awaiting Status Configuration</p>
              </div>
            )}
          </div>

          {status && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`w-full sm:w-auto px-14 py-6 rounded-2xl font-black text-base uppercase tracking-[0.2em] text-white transition-all active:scale-95 disabled:opacity-50 shadow-2xl ${
                  isExisting ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {isExisting ? 'Update Record' : 'Submit Entry'}
                    <ChevronRight size={24} />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
