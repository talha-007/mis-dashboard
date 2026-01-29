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
    title: 'Portfolio Overview',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Borrower Management',
    path: '/borrower-management',
    icon: icon('borrowers'),
    requiredPermission: Permission.VIEW_USERS,
  },
  {
    title: 'Loan Applications',
    path: '/loan-applications',
    icon: icon('applications'),
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
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Announcements',
    path: '/blog',
    icon: icon('ic-blog'),
  },
];

// Get navigation based on user role
export const getNavDataByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return superAdminNavData;
    case UserRole.CUSTOMER:
      return customerNavData;
    default:
      return customerNavData;
  }
};
