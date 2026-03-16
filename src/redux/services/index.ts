/**
 * Redux Services - Main barrel export
 * All API services organized by role. Use specific imports for tree-shaking.
 */

// Auth
export { default as authService } from './auth/auth.services';
// Shared
export { commonService, notificationsService } from './shared';
// Domain facades
export { default as bankService } from './facades/bank.services';
export { default as usersService } from './facades/users.services';
export { default as bankAuthService } from './auth/bank-auth.services';
export { default as paymentService } from './facades/payment.services';

export { default as borrowerService } from './facades/borrower.services';
export { default as employeeService } from './employee/employee.services';

export { default as customerService } from './customer/customer.services';
export { default as assessmentService } from './facades/assessment.services';

// Role-specific APIs
export { default as bankAdminService } from './bank-admin/bank-admin.services';
export { default as superadminService } from './superadmin/superadmin.services';
export { default as payoffOfferService } from './customer/payoff-offer.services';
export { default as systemUserService } from './system-user/system-user.services';
export { default as loanApplicationService } from './facades/loan-applications.services';
export {
  SocketEvent,
  socketService,
  type StatsUpdatePayload,
  type NotificationPayload,
} from './shared/socket.services';
