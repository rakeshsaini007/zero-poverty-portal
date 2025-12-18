
import { StudentData } from '../types';

// The URL provided by the user. 
// IMPORTANT: Ensure this is the "Web App" URL ending in /exec for production.
const GAS_WEB_APP_URL = 'https://script.google.com/macros/library/d/1q1DEMu-YXseEotsk3eMYXph1Vbvo7b8CPvMNoRyA_wiD4Da60Hgoyvx6/2';

export const fetchGramPanchayats = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${GAS_WEB_APP_URL}?action=getGPs`);
    if (!response.ok) throw new Error('Failed to fetch Gram Panchayats');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching GPs:', error);
    // Extract unique GPs from mock data for preview
    const unique = new Set(mockData.map(d => d.gramPanchayat));
    return Array.from(unique).sort();
  }
};

export const fetchAllData = async (gp?: string): Promise<StudentData[]> => {
  try {
    let url = `${GAS_WEB_APP_URL}?action=getData`;
    if (gp) url += `&gp=${encodeURIComponent(gp)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return gp ? mockData.filter(d => d.gramPanchayat === gp) : mockData;
  }
};

export const updateStudent = async (data: Partial<StudentData>): Promise<boolean> => {
  try {
    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateData', ...data }),
    });
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
    studentName: "PINKI",
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
  },
  {
    rowIndex: 4,
    familyId: "213640346615",
    gramPanchayat: "AHMAD NAGAR",
    studentName: "HANI",
    fatherName: "SANJYA SINGH",
    aadhaar: "317021803601",
    dob: "2015-01-01",
    age: 10,
    mobile: "9756191566",
    gender: "F",
    zeroPovertyId: "2031234",
    ineligibleReason: "",
    alreadyEnrolled: "",
    prevSchoolType: "",
    prevUdiseCode: "",
    newlyEnrolled: "",
    newSchoolType: "",
    newUdiseCode: ""
  }
];
