import { Iconify } from 'src/components/iconify';

import { UserRole, Permission } from 'src/types/auth.types';

// ----------------------------------------------------------------------
// Single icon set (Solar) for consistent nav appearance
const navIcon = (icon: string) => <Iconify icon={icon} width={24} height={24} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
};

// Navigation for Super Admin
export const superAdminNavData: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: navIcon('solar:chart-2-bold-duotone'),
  },
  {
    title: 'Bank Management',
    path: '/bank-management',
    icon: navIcon('solar:buildings-2-bold-duotone'),
    requiredPermission: Permission.VIEW_USERS,
  },
  {
    title: 'Subscriptions',
    path: '/subscriptions',
    icon: navIcon('solar:wallet-money-bold-duotone'),
    requiredPermission: Permission.VIEW_USERS,
  },
  {
    title: 'System Settings',
    path: '/settings',
    icon: navIcon('solar:settings-bold-duotone'),
  },
];

// Navigation for Admin
export const adminNavData: NavItem[] = [
  {
    title: 'Portfolio Overview',
    path: '/',
    icon: navIcon('solar:chart-2-bold-duotone'),
  },
  {
    title: 'Borrower Management',
    path: '/borrower-management',
    icon: navIcon('solar:users-group-two-rounded-bold-duotone'),
  },
  {
    title: 'Customer Management',
    path: '/users-management',
    icon: navIcon('solar:user-id-bold-duotone'),
  },
  {
    title: 'Employees',
    path: '/employees',
    icon: navIcon('solar:users-group-rounded-bold-duotone'),
  },
  {
    title: 'Loan Applications',
    path: '/loan-applications',
    icon: navIcon('solar:document-text-bold-duotone'),
  },
  {
    title: 'Assessment',
    path: '/assessment',
    icon: navIcon('solar:clipboard-check-bold-duotone'),
  },
  {
    title: 'Credit Proposal Reports',
    path: '/credit-proposal-reports',
    icon: navIcon('solar:document-bold-duotone'),
  },
  {
    title: 'Recoveries & Overdues',
    path: '/recoveries-overdues',
    icon: navIcon('solar:calendar-mark-bold-duotone'),
  },
  {
    title: 'Payments & Ledger',
    path: '/payments-ledger',
    icon: navIcon('solar:wallet-money-bold-duotone'),
  },
  {
    title: 'Credit Ratings',
    path: '/credit-ratings',
    icon: navIcon('solar:star-bold-duotone'),
  },
  {
    title: 'MIS & Reports',
    path: '/mis-reports',
    icon: navIcon('solar:pie-chart-2-bold-duotone'),
  },
  {
    title: 'Settings',
    path: '/bank-settings',
    icon: navIcon('solar:settings-bold-duotone'),
  },
];

// Navigation for Recovery Officer
export const recoveryOfficerNavData: NavItem[] = [
  {
    title: 'My Recovery Cases',
    path: '/employee/recovery-dashboard',
    icon: navIcon('solar:calendar-mark-bold-duotone'),
  },
];

// Navigation for Customer
export const customerNavData: NavItem[] = [
  {
    title: 'My Dashboard',
    path: '/',
    icon: navIcon('solar:home-angle-bold-duotone'),
  },
  {
    title: 'Apply for Loan',
    path: '/apply-loan',
    icon: navIcon('solar:document-add-bold-duotone'),
  },
  {
    title: 'My Installments',
    path: '/installments',
    icon: navIcon('solar:calendar-mark-bold-duotone'),
  },
  {
    title: 'Pay Installment',
    path: '/pay-installment',
    icon: navIcon('solar:card-send-bold-duotone'),
  },
  {
    title: 'My Credit Rating',
    path: '/my-credit-rating',
    icon: navIcon('solar:star-bold-duotone'),
  },
  {
    title: 'Payoff Offer',
    path: '/payoff-offer',
    icon: navIcon('solar:hand-money-bold-duotone'),
  },
  {
    title: 'Update Profile',
    path: '/profile',
    icon: navIcon('solar:user-bold-duotone'),
  },
  {
    title: 'Upload Documents',
    path: '/documents',
    icon: navIcon('solar:folder-with-files-bold-duotone'),
  },
];

// Get navigation based on user role (customer bank from server, no slug in URL)
export const getNavDataByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return superAdminNavData;
    case UserRole.ADMIN:
      return adminNavData;
    case UserRole.CUSTOMER:
      return customerNavData;
    case UserRole.RECOVERY_OFFICER:
      return recoveryOfficerNavData;
    default:
      return customerNavData;
  }
};
