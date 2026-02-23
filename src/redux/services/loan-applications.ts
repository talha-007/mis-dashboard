import bankAdminService from './bank-admin.services';
import systemUserService from './system-user.services';

/**
 * Loan Application Service (facade)
 * Create: system user (customer). List/Get/Update/Delete: bank admin.
 * Endpoints: /api/v1/systemUser/loan-applications, /api/v1/bankAdmin/loan-applications
 */

const create = (data: Record<string, unknown>) => systemUserService.createLoanApplication(data);

const list = (params?: Record<string, unknown>) => bankAdminService.getLoanApplications(params);

const getCustomerLoanApplications = (params?: Record<string, unknown>) =>
  bankAdminService.getCustomerLoanApplications(params);

const get = (id: string) => bankAdminService.getLoanApplicationById(id);

const update = (id: string, data: Record<string, unknown>) =>
  bankAdminService.updateLoanApplication(id, data);

const deleteById = (id: string) => bankAdminService.deleteLoanApplication(id);

const updateStatus = (id: string, data: any) =>
  bankAdminService.updateLoanApplicationStatus(id, data);

const getDueInstallment = () => bankAdminService.getDueInstallment();

const payInstallment = (installmentId: string) => bankAdminService.payInstallment(installmentId);

const getInstallmentHistory = (params?: Record<string, unknown>) =>
  bankAdminService.getInstallmentHistory(params);

const loanApplicationService = {
  create,
  list,
  get,
  update,
  deleteById,
  updateStatus,
  getCustomerLoanApplications,
  getDueInstallment,
  payInstallment,
  getInstallmentHistory,
};

export default loanApplicationService;
