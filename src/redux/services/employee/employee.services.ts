import type { AssessmentSubmitAnswer } from 'src/types/assessment.types';
import type { RecoveryStatsQuery } from 'src/types/employee-recovery-stats.types';

import { callAPi } from '../http-common';

/**
 * Employee Service (Recovery Officer / Staff)
 * Handles API calls for Employee role.
 * Endpoints: /api/v1/employee/*
 */

const getMyCases = (params?: any) => callAPi.get('/api/v1/employee/my-cases', { params });

const getMyCaseById = (id: string) => callAPi.get(`/api/v1/employee/my-cases/${id}`);

const addMyCaseNote = (id: string, data: any) =>
  callAPi.post(`/api/v1/employee/my-cases/${id}/notes`, data);

const updateMyCaseStatus = (id: string, data: any) =>
  callAPi.put(`/api/v1/employee/my-cases/${id}/status`, data);

/** Recovery performance stats (UTC calendar ranges; week = Mon–Sun UTC) */
const getRecoveryStats = (params: RecoveryStatsQuery) =>
  callAPi.get('/api/v1/employee/recovery-stats', { params });

// --- Customers ---
const createCustomer = (data: any) => callAPi.post('/api/v1/employee/customers', data);

const listCustomers = (params?: any) => callAPi.get('/api/v1/employee/customers', { params });

const getCustomerById = (id: string) => callAPi.get(`/api/v1/employee/customers/${id}`);

const updateCustomer = (id: string, data: any) =>
  callAPi.put(`/api/v1/employee/customers/${id}`, data);

const deleteCustomer = (id: string) => callAPi.delete(`/api/v1/employee/customers/${id}`);

// --- Assessment (submit on behalf of customer) ---
const submitAssessmentOnBehalf = (
  customerId: string,
  bankSlug: string,
  answers: AssessmentSubmitAnswer[]
) => callAPi.post('/api/v1/employee/assessments/submit', { customerId, bankSlug, answers });

// --- Loan Applications (on behalf of customer) ---
const applyLoanOnBehalf = (customerId: string, payload: Record<string, unknown>) =>
  callAPi.post('/api/v1/employee/loan-applications', { customerId, ...payload });

const employeeService = {
  getMyCases,
  getMyCaseById,
  addMyCaseNote,
  updateMyCaseStatus,
  getRecoveryStats,
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  submitAssessmentOnBehalf,
  applyLoanOnBehalf,
};

export default employeeService;
