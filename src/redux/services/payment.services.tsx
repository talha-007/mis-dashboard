import { callAPi } from './http-common';

// Get all bank subscriptions/payments (optional query params: search, page, limit, status)
const getBankSubscriptions = (params?: {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}) => callAPi.get(`/api/subscriptions`, { params });

/** Create/pay subscription for a bank (bank admin) - POST /api/subscriptions */
const createSubscription = (payload: { bankId: string; amount: number }) =>
  callAPi.post('/api/subscriptions', payload);

// Create a new payment/subscription
const createPayment = (bankId: string, data: any) => callAPi.post(`/api/banks/subscriptions/${bankId}`, data);

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
  createSubscription,
  createPayment,

  processPayment,
  cancelSubscription,
  renewSubscription,
  recordPayment,
  generateInvoice,
};

export default paymentService;
