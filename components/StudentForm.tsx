
import React, { useState } from 'react';
import { StudentData, EnrollmentStatus, INELIGIBLE_REASONS, SchoolType } from '../types';

interface StudentFormProps {
  student: StudentData;
  onUpdate: (updatedData: Partial<StudentData>) => Promise<void>;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onUpdate }) => {
  const [status, setStatus] = useState<EnrollmentStatus | null>(
    student.ineligibleReason ? EnrollmentStatus.INELIGIBLE :
    student.alreadyEnrolled ? EnrollmentStatus.ALREADY_ENROLLED :
    student.newlyEnrolled ? EnrollmentStatus.NEWLY_ENROLLED : null
  );
  const [subField, setSubField] = useState<string>(student.ineligibleReason || '');
  const [schoolType, setSchoolType] = useState<SchoolType>((student.prevSchoolType || student.newSchoolType || '') as SchoolType);
  const [udiseCode, setUdiseCode] = useState<string>(student.prevUdiseCode || student.newUdiseCode || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const updatePayload: Partial<StudentData> = {
      rowIndex: student.rowIndex,
      ineligibleReason: status === EnrollmentStatus.INELIGIBLE ? subField : '',
      alreadyEnrolled: status === EnrollmentStatus.ALREADY_ENROLLED ? 'Yes' : '',
      prevSchoolType: status === EnrollmentStatus.ALREADY_ENROLLED ? schoolType : '',
      prevUdiseCode: status === EnrollmentStatus.ALREADY_ENROLLED ? udiseCode : '',
      newlyEnrolled: status === EnrollmentStatus.NEWLY_ENROLLED ? 'Yes' : '',
      newSchoolType: status === EnrollmentStatus.NEWLY_ENROLLED ? schoolType : '',
      newUdiseCode: status === EnrollmentStatus.NEWLY_ENROLLED ? udiseCode : '',
    };

    // UDISE Validation
    if ((status === EnrollmentStatus.ALREADY_ENROLLED || status === EnrollmentStatus.NEWLY_ENROLLED)) {
      if (!/^0\d{10}$/.test(udiseCode)) {
        alert('विद्यालय का यूडायस कोड 11 अंकों का होना चाहिए और 0 से शुरू होना चाहिए।');
        setLoading(false);
        return;
      }
      if (!schoolType) {
        alert('कृपया विद्यालय का प्रकार चुनें।');
        setLoading(false);
        return;
      }
    }

    if (status === EnrollmentStatus.INELIGIBLE && !subField) {
      alert('कृपया अपात्रता का कारण चुनें।');
      setLoading(false);
      return;
    }

    await onUpdate(updatePayload);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
      <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white uppercase tracking-wider">
          {student.studentName}
        </h3>
        <span className="bg-indigo-500 text-indigo-50 text-xs font-semibold px-3 py-1 rounded-full">
          ID: {student.zeroPovertyId}
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-sm text-slate-600">
          <div><p className="font-semibold text-slate-400 uppercase text-[10px]">Father's Name</p><p className="text-slate-900 font-medium">{student.fatherName}</p></div>
          <div><p className="font-semibold text-slate-400 uppercase text-[10px]">Aadhaar</p><p className="text-slate-900 font-medium">{student.aadhaar}</p></div>
          <div><p className="font-semibold text-slate-400 uppercase text-[10px]">Age / Gender</p><p className="text-slate-900 font-medium">{student.age} yrs / {student.gender}</p></div>
          <div><p className="font-semibold text-slate-400 uppercase text-[10px]">Mobile</p><p className="text-slate-900 font-medium">{student.mobile}</p></div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {[
              EnrollmentStatus.INELIGIBLE,
              EnrollmentStatus.ALREADY_ENROLLED,
              EnrollmentStatus.NEWLY_ENROLLED
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setSaved(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                  status === s
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {status === EnrollmentStatus.INELIGIBLE && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-slate-700 mb-2">अपात्रता का कारण चुनें</label>
              <select
                value={subField}
                onChange={(e) => setSubField(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
              >
                <option value="">-- चुनें --</option>
                {INELIGIBLE_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {(status === EnrollmentStatus.ALREADY_ENROLLED || status === EnrollmentStatus.NEWLY_ENROLLED) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">विद्यालय का प्रकार</label>
                <select
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value as SchoolType)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <option value="">-- चुनें --</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">विद्यालय का यूडायस कोड</label>
                <input
                  type="text"
                  placeholder="09050304704"
                  value={udiseCode}
                  maxLength={11}
                  onChange={(e) => setUdiseCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                />
                <p className="mt-1 text-xs text-slate-400">11 अंकों का कोड जो 0 से शुरू हो।</p>
              </div>
            </div>
          )}

          {status && (
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${
                  loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'
                }`}
              >
                {loading ? 'सहेजा जा रहा है...' : 'डाटा सुरक्षित करें'}
              </button>
              {saved && (
                <span className="text-green-600 font-semibold animate-bounce">✓ सफलतापूर्वक सुरक्षित किया गया</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
