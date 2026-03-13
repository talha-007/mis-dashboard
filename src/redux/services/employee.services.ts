import { callAPi } from './http-common';

/**
 * Recovery officer / employee service
 * Endpoints: /api/v1/employee/*
 */

const getMyCases = (params?: any) => callAPi.get('/api/v1/employee/my-cases', { params });

const getMyCaseById = (id: string) => callAPi.get(`/api/v1/employee/my-cases/${id}`);

const addMyCaseNote = (id: string, data: any) =>
  callAPi.post(`/api/v1/employee/my-cases/${id}/notes`, data);

const updateMyCaseStatus = (id: string, data: any) =>
  callAPi.put(`/api/v1/employee/my-cases/${id}/status`, data);

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
  answers: Array<{ fieldKey: string; amount: number }>
) => callAPi.post('/api/v1/employee/assessments/submit', { customerId, bankSlug, answers });

// --- Loan Applications (on behalf of customer) ---
const applyLoanOnBehalf = (customerId: string, payload: Record<string, unknown>) =>
  callAPi.post('/api/v1/employee/loan-applications', { customerId, ...payload });

const employeeService = {
  getMyCases,
  getMyCaseById,
  addMyCaseNote,
  updateMyCaseStatus,
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  submitAssessmentOnBehalf,
  applyLoanOnBehalf,
};

export default employeeService;
