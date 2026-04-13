/** Query params for GET /api/v1/employee/recovery-stats */
export type RecoveryStatsPeriod = 'day' | 'week' | 'month' | 'year';

export type RecoveryStatsQuery = {
  period: RecoveryStatsPeriod;
  /** ISO date YYYY-MM-DD (UTC calendar day). Required for period=day; optional anchor for week/month/year. */
  at?: string;
};

/** Response envelope: `{ message, period, stats }` */
export type EmployeeRecoveryStatsEnvelope = {
  message?: string;
  period?: {
    type?: string;
    start?: string;
    end?: string;
  };
  stats?: EmployeeRecoveryStatsBody;
};

/** `stats` object from recovery-stats API (camelCase) */
export type EmployeeRecoveryStatsBody = {
  activeCasesCount?: number;
  totalAmountToRecover?: number;
  totalCasesAssignedToMe?: number;
  activeCasesByStatus?: Record<string, number>;
  inSelectedPeriod?: {
    newAssignmentsCount?: number;
    resolvedCasesCount?: number;
  };
};

/** Legacy: view may hold stats fields only */
export type EmployeeRecoveryStatsData = Record<string, unknown> & {
  period?: RecoveryStatsPeriod;
  range?: { start?: string; end?: string };
};
