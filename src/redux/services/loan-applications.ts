import bankAdminService from './bank-admin.services';
import systemUserService from './system-user.services';

/**
 * Loan Application Service (facade)
 * Create: system user (customer). List/Get/Update/Delete: bank admin.
 * Endpoints: /api/v1/systemUser/loan-applications, /api/v1/bankAdmin/loan-applications
 */

const create = (data: Record<string, unknown>) =>
  systemUserService.createLoanApplication(data);

const list = (params?: Record<string, unknown>) =>
  bankAdminService.getLoanApplications(params);

const get = (id: string) => bankAdminService.getLoanApplicationById(id);

const update = (id: string, data: Record<string, unknown>) =>
  bankAdminService.updateLoanApplication(id, data);

const deleteById = (id: string) => bankAdminService.deleteLoanApplication(id);

const loanApplicationService = {
  create,
  list,
  get,
  update,
  deleteById,
};

export default loanApplicationService;
