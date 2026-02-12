import { callAPi } from './http-common';

// Get all bank subscriptions/payments
const getBankSubscriptions = (params?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  return callAPi.get(`/api/banks/subscriptions${queryString ? `?${queryString}` : ''}`);
};

// Get a single subscription by ID
const getSubscriptionById = (id: string) => callAPi.get(`/api/banks/subscriptions/${id}`);

// Create a new payment/subscription
const createPayment = (data: any) => callAPi.post('/api/banks/subscriptions', data);

// Update a subscription
const updateSubscription = (id: string, data: any) =>
  callAPi.put(`/api/banks/subscriptions/${id}`, data);

// Process payment
const processPayment = (subscriptionId: string, paymentData: any) =>
  callAPi.post(`/api/banks/subscriptions/${subscriptionId}/payments`, paymentData);

// Cancel subscription
const cancelSubscription = (id: string) => callAPi.post(`/api/banks/subscriptions/${id}/cancel`);

// Renew subscription
const renewSubscription = (id: string) => callAPi.post(`/api/banks/subscriptions/${id}/renew`);

// Record payment for a bank (creates/activates monthly subscription)
const recordPayment = (data: {
  bankId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  notes?: string;
}) => callAPi.post('/api/banks/subscriptions/record-payment', data);

// Generate and download invoice PDF
const generateInvoice = (paymentId: string) =>
  callAPi.get(`/api/banks/subscriptions/payments/${paymentId}/invoice`, {
    responseType: 'blob',
  });

const paymentService = {
  getBankSubscriptions,
  getSubscriptionById,
  createPayment,
  updateSubscription,
  processPayment,
  cancelSubscription,
  renewSubscription,
  recordPayment,
  generateInvoice,
};

export default paymentService;
