/** Values sent as multipart field `document_type` (must match backend) */
export const CUSTOMER_DOCUMENT_TYPE_VALUES = [
  'cnic_front',
  'cnic_back',
  'id_card',
  'income_proof',
  'bank_statement',
  'salary_slip',
  'utility_bill',
  'photo',
  'other',
] as const;

export type CustomerDocumentType = (typeof CUSTOMER_DOCUMENT_TYPE_VALUES)[number];

export type CustomerDocument = {
  id: string;
  documentType: string;
  fileName: string;
  url: string | null;
  createdAt: string | null;
};

/** Human-readable labels for list + upload sections */
export const CUSTOMER_DOCUMENT_LABELS: Record<CustomerDocumentType, string> = {
  cnic_front: 'CNIC (front)',
  cnic_back: 'CNIC (back)',
  id_card: 'ID card',
  income_proof: 'Income proof',
  bank_statement: 'Bank statement',
  salary_slip: 'Salary slip',
  utility_bill: 'Utility bill',
  photo: 'Photo',
  other: 'Other',
};

/** Short helper text under each upload card */
export const CUSTOMER_DOCUMENT_DESCRIPTIONS: Record<CustomerDocumentType, string> = {
  cnic_front: 'Clear photo or scan of the front of your CNIC.',
  cnic_back: 'Clear photo or scan of the back of your CNIC.',
  id_card: 'National ID or other government-issued photo ID.',
  income_proof: 'Documents showing your income (e.g. tax certificate, employer letter).',
  bank_statement: 'Recent bank statement (PDF or image).',
  salary_slip: 'Recent payslip or salary certificate.',
  utility_bill: 'Electricity, gas, or water bill as proof of address.',
  photo: 'A recent passport-style photograph.',
  other: 'Any other document requested by the bank.',
};
