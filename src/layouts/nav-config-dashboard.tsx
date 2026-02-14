import { SvgColor } from 'src/components/svg-color';

import { UserRole, Permission } from 'src/types/auth.types';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

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
    icon: icon('ic-analytics'),
  },
  {
    title: 'Bank Management',
    path: '/bank-management',
    icon: icon('ic-user'),
    requiredPermission: Permission.VIEW_USERS,
  },
  {
    title: 'Subscriptions',
    path: '/subscriptions',
    icon: icon('ic-payments'),
    requiredPermission: Permission.VIEW_USERS,
  },
  {
    title: 'System Settings',
    path: '/settings',
    icon: icon('ic-settings'),
  },
];

// Navigation for Admin
export const adminNavData: NavItem[] = [
  {
    title: 'Portfolio Overview',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Borrower Management',
    path: '/borrower-management',
    icon: icon('borrowers'),
  },
  {
    title: 'Loan Applications',
    path: '/loan-applications',
    icon: icon('applications'),
  },
  {
    title: 'Assessment',
    path: '/assessment',
    icon: icon('ratings'),
  },
  {
    title: 'Credit Proposal Reports',
    path: '/credit-proposal-reports',
    icon: icon('reports'),
  },
  {
    title: 'Recoveries & Overdues',
    path: '/recoveries-overdues',
    icon: icon('recoveries'),
  },
  {
    title: 'Payments & Ledger',
    path: '/payments-ledger',
    icon: icon('payments'),
  },
  {
    title: 'Credit Ratings',
    path: '/credit-ratings',
    icon: icon('ratings'),
  },
  {
    title: 'MIS & Reports',
    path: '/mis-reports',
    icon: icon('reports'),
  },
];

// Navigation for Customer
export const customerNavData: NavItem[] = [
  {
    title: 'My Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Assessment',
    path: '/assessment',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Apply for Loan',
    path: '/apply-loan',
    icon: icon('ic-invoice'),
  },
  {
    title: 'My Installments',
    path: '/installments',
    icon: icon('ic-payments'),
  },
  {
    title: 'Pay Installment',
    path: '/pay-installment',
    icon: icon('ic-pay'),
  },
  {
    title: 'My Credit Rating',
    path: '/my-credit-rating',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Payoff Offer',
    path: '/payoff-offer',
    icon: icon('ic-payoff'),
  },
  {
    title: 'Update Profile',
    path: '/profile',
    icon: icon('ic-profile'),
  },
  {
    title: 'Upload Documents',
    path: '/documents',
    icon: icon('ic-file'),
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
    default:
      return customerNavData;
  }
};
