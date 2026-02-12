import { callAPi } from './http-common';

/**
 * Borrower Service
 * Handles API calls for borrower management
 * Endpoints: /api/borrowers
 */

// Create a new borrower
const create = (data: any) => callAPi.post('/api/borrowers', data);

// Get all borrowers with optional pagination and filters
const list = (params?: any) => callAPi.get('/api/borrowers', { params });

// Get a single borrower by ID
const get = (id: string) => callAPi.get(`/api/borrowers/${id}`);

// Update a borrower
const update = (id: string, data: any) => callAPi.put(`/api/borrowers/${id}`, data);

// Delete a borrower
const deleteById = (id: string) => callAPi.delete(`/api/borrowers/${id}`);

const borrowerService = {
  create,
  list,
  get,
  update,
  deleteById,
};

export default borrowerService;
