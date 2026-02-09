import { callAPi } from './http-common';

// Get all banks (with search, pagination, and sorting)
const getBanks = (params?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  return callAPi.get(`/api/banks/${queryString ? `?${queryString}` : ''}`);
};

// Get a single bank by ID
const getBankById = (id: string) => callAPi.get(`/api/banks/${id}`);

// Search bank by code
const searchBankByCode = (code: string) => callAPi.get(`/api/banks/search?code=${code}`);

// Get bank subscription details (last payment, next payment)
const getBankSubscriptionDetails = (bankId: string) => 
  callAPi.get(`/api/banks/${bankId}/subscription-details`);

// Create a new bank
const addBank = (data: any) => callAPi.post('/api/banks/', data);

// Update a bank
const updateBank = (id: string, data: any) => callAPi.put(`/api/banks/${id}`, data);

// Delete a bank
const deleteBank = (id: string) => callAPi.delete(`/api/banks/${id}`);

const bankService = {
  getBanks,
  getBankById,
  searchBankByCode,
  getBankSubscriptionDetails,
  addBank,
  updateBank,
  deleteBank,
};

export default bankService;
