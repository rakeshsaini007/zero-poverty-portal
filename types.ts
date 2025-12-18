
export interface StudentData {
  rowIndex: number;
  familyId: string;
  gramPanchayat: string;
  studentName: string;
  fatherName: string;
  aadhaar: string;
  dob: string;
  age: number;
  mobile: string;
  gender: string;
  zeroPovertyId: string;
  ineligibleReason: string;
  alreadyEnrolled: string;
  prevSchoolType: string;
  prevUdiseCode: string;
  newlyEnrolled: string;
  newSchoolType: string;
  newUdiseCode: string;
  isProcessed?: boolean;
}

export enum EnrollmentStatus {
  INELIGIBLE = 'सदस्य नामांकन हेतु अपात्र है',
  ALREADY_ENROLLED = 'पूर्व से नामांकित है',
  NEWLY_ENROLLED = 'नया नामांकन करा गया है'
}

export type SchoolType = 'Government' | 'Private' | '';

export const INELIGIBLE_REASONS = [
  "बच्चे की आयु 6 वर्ष से कम है।",
  "बच्चे की आयु 14 वर्ष से अधिक है।",
  "बच्चे की मृत्यु हो गई है।",
  "बच्चा अन्य स्थान पर रहता है।",
  "बच्चा बहु-दिव्यांग है।",
  "अन्य"
];
