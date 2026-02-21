import bankAdminService from './bank-admin.services';

/**
 * Borrower Service (facade)
 * Delegates to bank-admin.service borrowers API.
 * Endpoints: /api/v1/bankAdmin/borrowers
 */

const create = (data: any) => bankAdminService.createBorrower(data);

const list = (params?: any) => bankAdminService.getBorrowers(params);

const get = (id: string) => bankAdminService.getBorrowerById(id);

const update = (id: string, data: any) => bankAdminService.updateBorrower(id, data);

const deleteById = (id: string) => bankAdminService.deleteBorrower(id);

const borrowerService = {
  create,
  list,
  get,
  update,
  deleteById,
};

export default borrowerService;
