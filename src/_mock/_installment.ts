export type Installment = {
  id: string;
  month: string;
  amount: number;
  status: string;
  dueDate: string;
};

export const _installments: Installment[] = [];
