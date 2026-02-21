import { callAPi } from './http-common';

/**
 * System User Service
 * Handles API calls for logged-in customer (system user): loan applications and assessments.
 * Endpoints: /api/v1/*
 */

const createLoanApplication = (data: any) => callAPi.post('/api/v1/loan-applications', data);

const submitAssessment = (data: any) => callAPi.post('/api/v1/assessments/submit', data);

const getMyAssessments = (params?: any) =>
  callAPi.get('/api/v1/assessments/my-assessments', { params });

const getAssessmentResults = (assessmentId: string) =>
  callAPi.get(`/api/v1/assessments/results/${assessmentId}`);

const systemUserService = {
  createLoanApplication,
  submitAssessment,
  getMyAssessments,
  getAssessmentResults,
};

export default systemUserService;
