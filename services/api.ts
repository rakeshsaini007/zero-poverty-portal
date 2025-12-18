
import { StudentData } from '../types';

// The URL provided by the user. 
// IMPORTANT: Ensure this is the "Web App" URL ending in /exec for production.
const GAS_WEB_APP_URL = 'https://script.google.com/macros/library/d/1q1DEMu-YXseEotsk3eMYXph1Vbvo7b8CPvMNoRyA_wiD4Da60Hgoyvx6/2';

export const fetchAllData = async (): Promise<StudentData[]> => {
  try {
    // Check if we are still using a placeholder or a library URL instead of an exec URL
    if (GAS_WEB_APP_URL.includes('/library/')) {
      console.warn('The URL provided looks like a library URL. Please ensure you use the Web App "exec" URL from the GAS Deploy menu.');
    }

    const response = await fetch(`${GAS_WEB_APP_URL}?action=getData`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return mockData;
  }
};

export const updateStudent = async (data: Partial<StudentData>): Promise<boolean> => {
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'updateData', ...data }),
    });
    // With no-cors, we assume success if no error is thrown during fetch
    return true;
  } catch (error) {
    console.error('Error updating student:', error);
    return false;
  }
};

const mockData: StudentData[] = [
  {
    rowIndex: 2,
    familyId: "213640699925",
    gramPanchayat: "MOHABBAT NAGAR",
    studentName: "PINKI (Mock)",
    fatherName: "NANESH KUMAR",
    aadhaar: "726753503501",
    dob: "2016-12-28",
    age: 8,
    mobile: "8449546286",
    gender: "F",
    zeroPovertyId: "2015483",
    ineligibleReason: "",
    alreadyEnrolled: "",
    prevSchoolType: "",
    prevUdiseCode: "",
    newlyEnrolled: "",
    newSchoolType: "",
    newUdiseCode: ""
  }
];
