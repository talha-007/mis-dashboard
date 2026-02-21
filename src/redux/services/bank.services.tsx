import superadminService from './superadmin.services';
import bankAdminService from './bank-admin.services';

/**
 * Bank Service (facade)
 * Superadmin: list, get, add, delete, status, subscription.
 * Bank Admin: update bank.
 */

const getBanks = (params?: any) => superadminService.getBanks(params);

const getBankById = (id: string) => superadminService.getBankById(id);

const addBank = (data: any) => superadminService.addBank(data);

const updateBank = (id: string, data: any) => bankAdminService.updateBank(id, data);

const deleteBank = (id: string) => superadminService.deleteBank(id);

const changeBankStatus = (id: string, status: string) =>
  superadminService.changeBankStatus(id, { status });

const searchBankByCode = (code: string) =>
  superadminService.getBanks({ search: code });

const getBankSubscriptionDetails = (bankId: string) =>
  superadminService.getSubscriptionById(bankId);

const bankService = {
  getBanks,
  getBankById,
  searchBankByCode,
  getBankSubscriptionDetails,
  addBank,
  updateBank,
  deleteBank,
  changeBankStatus,
};

export default bankService;
