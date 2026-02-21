import bankAdminService from './bank-admin.services';

/**
 * Users Service (General Users)
 * Delegates to bank-admin.service users API.
 * Endpoints: /api/users/general/*
 */

const create = (data: any) => bankAdminService.createUser(data);

const list = (params?: any) => bankAdminService.getUsers(params);

const get = (userId: string) => bankAdminService.getUserById(userId);

const update = (userId: string, data: any) => bankAdminService.updateUser(userId, data);

const deleteById = (userId: string) => bankAdminService.deleteUser(userId);

const usersService = {
  create,
  list,
  get,
  update,
  deleteById,
};

export default usersService;
