/**
 * Mock Installment History Data
 */

export const _installments = [
  {
    id: '1',
    month: 'August',
    amount: 18500,
    status: 'paid',
    dueDate: '2026-08-15',
  },
  {
    id: '2',
    month: 'September',
    amount: 18500,
    status: 'due',
    dueDate: '2026-09-15',
  },
  {
    id: '3',
    month: 'October',
    amount: 18500,
    status: 'upcoming',
    dueDate: '2026-10-15',
  },
  {
    id: '4',
    month: 'November',
    amount: 18500,
    status: 'upcoming',
    dueDate: '2026-11-15',
  },
  {
    id: '5',
    month: 'December',
    amount: 18500,
    status: 'upcoming',
    dueDate: '2026-12-15',
  },
];

export type Installment = (typeof _installments)[number];
