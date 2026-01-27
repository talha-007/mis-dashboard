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
    title: 'Customers',
    path: '/user',
    icon: icon('ic-user'),
    requiredPermission: Permission.VIEW_USERS,
  },
  {
    title: 'Announcements',
    path: '/blog',
    icon: icon('ic-blog'),
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
