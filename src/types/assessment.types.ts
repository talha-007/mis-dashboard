// ----------------------------------------------------------------------
// Bank assessment: multiple-choice questions (points) + custom fields (customer enters values)
// Bank admin assigns whatever points they want to each option. Total score = sum of each question's max points.
// ----------------------------------------------------------------------

export type AssessmentOption = {
  _id: string;
  text: string;
  points: number; // Bank admin assigns any points per option (no fixed total)
};

export type AssessmentQuestion = {
  _id: string;
  type: 'multiple_choice';
  text: string;
  order: number;
  options: AssessmentOption[];
};

/** Custom field: customer enters value (number or text). No score. */
export type AssessmentCustomField = {
  _id: string;
  type: 'custom_field';
  fieldKey: string;
  label: string;
  inputType: 'number' | 'text';
  order: number;
  unit?: string; // e.g. "PKR/month"
};

export type AssessmentItem = AssessmentQuestion | AssessmentCustomField;

export function isMultipleChoice(item: AssessmentItem): item is AssessmentQuestion {
  return item.type === 'multiple_choice';
}

export function isCustomField(item: AssessmentItem): item is AssessmentCustomField {
  return item.type === 'custom_field';
}

export type BankAssessment = {
  slug: string;
  questions: AssessmentItem[]; // MC questions + custom fields
  totalMaxScore: number; // Sum of max points from multiple_choice items (bank decides points per option)
};

// ----------------------------------------------------------------------
// Predefined custom field labels (bank can ask these; customer enters values)
// ----------------------------------------------------------------------

export const ASSESSMENT_CUSTOM_FIELD_OPTIONS: { fieldKey: string; label: string }[] = [
  { fieldKey: 'salary_income', label: 'Salary Income' },
  { fieldKey: 'business_income', label: 'Business Income' },
  { fieldKey: 'investment_income', label: 'Investment Income' },
  { fieldKey: 'house_rental', label: 'House Rental' },
  { fieldKey: 'car_rental', label: 'Car Rental' },
  { fieldKey: 'utilities_bills', label: 'Utilities Bills' },
  { fieldKey: 'installments', label: 'Installments' },
  { fieldKey: 'fuel_expenses', label: 'Fuel Expenses' },
  { fieldKey: 'grocery_expenses', label: 'Grocery Expenses' },
  { fieldKey: 'medical_bills', label: 'Medical Bills' },
  { fieldKey: 'insurance', label: 'Insurance' },
  { fieldKey: 'fees', label: 'Fees' },
  { fieldKey: 'miscellaneous', label: 'Miscellaneous' },
];

// ----------------------------------------------------------------------
// Customer assessment submission
// ----------------------------------------------------------------------

export type AssessmentAnswer = {
  questionId: string;
  optionId: string;
  points: number;
};

export type CustomFieldValue = {
  fieldId: string;
  value: string | number;
};

export type AssessmentSubmission = {
  _id: string;
  customerId: string;
  slug: string;
  score: number; // From multiple-choice answers only; total max 100
  totalScore: number;
  answers: AssessmentAnswer[];
  customFieldValues?: CustomFieldValue[];
  submittedAt: string;
};

// ----------------------------------------------------------------------
// Credit proposal report (admin: customer + assessment + loan)
// ----------------------------------------------------------------------

export type CreditProposalReportStatus = 'pending' | 'approved' | 'rejected';

export type CreditProposalReportCustomer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
};

export type CreditProposalReportAnswerSnapshot = {
  questionText: string;
  chosenOptionText: string;
  points: number;
};

export type CreditProposalReportCustomFieldSnapshot = {
  label: string;
  value: string | number;
};

export type CreditProposalReport = {
  _id: string;
  customerId: string;
  customer: CreditProposalReportCustomer;
  assessmentSubmissionId: string;
  score: number;
  totalScore: number;
  loanApplicationId: string;
  loanAmount: number;
  loanType?: string;
  loanPurpose?: string;
  status: CreditProposalReportStatus;
  submittedAt: string;
  answersSnapshot?: CreditProposalReportAnswerSnapshot[];
  customFieldSnapshot?: CreditProposalReportCustomFieldSnapshot[];
};
