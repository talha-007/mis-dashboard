/**
 * Loan installment helpers (aligned with apply-loan EMI logic).
 * Previews are approximate; the server is authoritative for reschedule.
 */

/** Monthly EMI: P * r * (1+r)^n / ((1+r)^n - 1); r = monthly rate (annual % / 100 / 12). */
export function calcEMI(principal: number, annualRatePercent: number, months: number): number {
  if (months <= 0) return Math.round(principal);
  const r = annualRatePercent / 100 / 12;
  if (r <= 0) return Math.round(principal / months);
  const factor = (1 + r) ** months;
  return Math.round((principal * r * factor) / (factor - 1));
}

/**
 * Rough monthly payment for a tenor: amortized interest + optional insurance as % p.a. on principal / 12.
 */
export function estimateMonthlyInstallmentPreview(params: {
  principal: number;
  months: number;
  /** Annual interest % (same units as bank settings / projected plan). */
  annualInterestPercent: number | null;
  /** Annual insurance % of principal (optional). */
  annualInsurancePercent: number | null;
}): number | null {
  const { principal, months, annualInterestPercent, annualInsurancePercent } = params;
  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(months) || months < 1 || !Number.isInteger(months)) return null;

  const emi =
    annualInterestPercent != null && annualInterestPercent > 0
      ? calcEMI(principal, annualInterestPercent, months)
      : Math.round(principal / months);

  const insuranceMonthly =
    annualInsurancePercent != null && annualInsurancePercent > 0
      ? (principal * (annualInsurancePercent / 100)) / 12
      : 0;

  return Math.round(emi + insuranceMonthly);
}
