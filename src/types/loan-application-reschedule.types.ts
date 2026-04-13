/** POST /api/v1/bankAdmin/loan-applications/:id/reschedule-payment-plan */

export type ReschedulePaymentPlanMode = 'auto' | 'full' | 'unpaid_only';

export type ReschedulePaymentPlanPayload = {
  mode: ReschedulePaymentPlanMode;
  /** Length of the new schedule (semantics depend on mode). */
  durationMonths?: number;
  /** Fixed amount per new installment. */
  installmentAmount?: number;
  /** First new due date (ISO date string, e.g. YYYY-MM-DD). */
  firstDueDate?: string;
  /** Full reset only: recompute installment from loan amount, duration, bank rates. */
  recalculateFromRates?: boolean;
};
