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

const employeeService = {
  getMyCases,
  getMyCaseById,
  addMyCaseNote,
  updateMyCaseStatus,
};

export default employeeService;
