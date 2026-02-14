import type { BankAssessment } from 'src/types/assessment.types';

// Mock: total score 100 from multiple-choice questions only (25+25+25+25). Custom fields have no points.
export const _bankAssessment: BankAssessment = {
  bankId: 'bank-001',
  totalMaxScore: 100,
  questions: [
    {
      _id: 'q1',
      type: 'multiple_choice',
      text: 'What is your employment type?',
      order: 1,
      options: [
        { _id: 'q1-o1', text: 'Salaried (full-time)', points: 25 },
        { _id: 'q1-o2', text: 'Self-employed', points: 15 },
        { _id: 'q1-o3', text: 'Part-time / Contract', points: 10 },
        { _id: 'q1-o4', text: 'Unemployed', points: 0 },
      ],
    },
    {
      _id: 'f1',
      type: 'custom_field',
      fieldKey: 'salary_income',
      label: 'Salary Income (PKR/month)',
      inputType: 'number',
      order: 2,
      unit: 'PKR/month',
    },
    {
      _id: 'f2',
      type: 'custom_field',
      fieldKey: 'business_income',
      label: 'Business Income (PKR/month)',
      inputType: 'number',
      order: 3,
      unit: 'PKR/month',
    },
    {
      _id: 'q2',
      type: 'multiple_choice',
      text: 'What is your monthly income range?',
      order: 4,
      options: [
        { _id: 'q2-o1', text: 'Above 100,000', points: 25 },
        { _id: 'q2-o2', text: '50,000 – 100,000', points: 18 },
        { _id: 'q2-o3', text: '25,000 – 50,000', points: 10 },
        { _id: 'q2-o4', text: 'Below 25,000', points: 5 },
      ],
    },
    {
      _id: 'f3',
      type: 'custom_field',
      fieldKey: 'utilities_bills',
      label: 'Utilities Bills (PKR/month)',
      inputType: 'number',
      order: 5,
      unit: 'PKR/month',
    },
    {
      _id: 'q3',
      type: 'multiple_choice',
      text: 'Do you have any existing loans?',
      order: 6,
      options: [
        { _id: 'q3-o1', text: 'No existing loans', points: 25 },
        { _id: 'q3-o2', text: 'One loan, repayments on time', points: 18 },
        { _id: 'q3-o3', text: 'Multiple loans, all on time', points: 12 },
        { _id: 'q3-o4', text: 'Past defaults or late payments', points: 0 },
      ],
    },
    {
      _id: 'q4',
      type: 'multiple_choice',
      text: 'How long have you been with your current employer?',
      order: 7,
      options: [
        { _id: 'q4-o1', text: 'More than 3 years', points: 25 },
        { _id: 'q4-o2', text: '1–3 years', points: 18 },
        { _id: 'q4-o3', text: '6 months – 1 year', points: 10 },
        { _id: 'q4-o4', text: 'Less than 6 months', points: 5 },
      ],
    },
  ],
};
