import bankAdminService from './bank-admin.services';
import superadminService from './superadmin.services';

/**
 * Payment / Subscription Service (facade)
 * Payment ledgers: bank admin. Subscriptions: create via bank admin, list/get/update/delete via superadmin.
 * Endpoints: /api/v1/bankAdmin/payment-ledgers, /api/v1/subscriptions, /api/v1/superAdmin/subscriptions
 */

const getPaymentLedgers = (params?: any) => bankAdminService.getPaymentLedgers(params);
const getPaymentLedgerById = (id: string) => bankAdminService.getPaymentLedgerById(id);
const createPaymentLedger = (data: any) => bankAdminService.createPaymentLedger(data);
const updatePaymentLedger = (id: string, data: any) => bankAdminService.updatePaymentLedger(id, data);
const deletePaymentLedger = (id: string) => bankAdminService.deletePaymentLedger(id);

const getBankSubscriptions = (params?: any) => superadminService.getSubscriptions(params);
const getSubscriptionById = (id: string) => superadminService.getSubscriptionById(id);
const createSubscription = (data: any) => bankAdminService.createSubscription(data);
const updateSubscription = (id: string, data: any) => superadminService.updateSubscription(id, data);
const deleteSubscription = (id: string) => superadminService.deleteSubscription(id);

// Legacy names for compatibility
const createPayment = (bankId: string, data: any) => createSubscription({ bankId, ...data });
const processPayment = (subscriptionId: string, paymentData: any) =>
  Promise.resolve({ data: paymentData });
const cancelSubscription = (id: string) => deleteSubscription(id);
const renewSubscription = (_id: string) => Promise.resolve({ data: {} });
const recordPayment = (data: any) => createSubscription(data);
const generateInvoice = (_paymentId: string) =>
  Promise.reject(new Error('Generate invoice endpoint not in README'));

const paymentService = {
  getBankSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getPaymentLedgers,
  getPaymentLedgerById,
  createPaymentLedger,
  updatePaymentLedger,
  deletePaymentLedger,
  createPayment,
  processPayment,
  cancelSubscription,
  renewSubscription,
  recordPayment,
  generateInvoice,
};

export default paymentService;
