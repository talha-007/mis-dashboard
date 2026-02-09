import { useAuth } from 'src/hooks/use-auth';

import { CONFIG } from 'src/config-global';

import { PortfolioOverviewView } from 'src/sections/portfolio/view';
import { CustomerDashboardView } from 'src/sections/customer/dashboard';

import { UserRole } from 'src/types/auth.types';

// ----------------------------------------------------------------------

export default function Page() {
  const { user } = useAuth();

  // Show customer dashboard for customers, portfolio overview for admin/superadmin
  const isCustomer = user?.role === UserRole.CUSTOMER;

  return (
    <>
      <title>{`${isCustomer ? 'Dashboard' : 'Portfolio Overview'} - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content={
          isCustomer
            ? 'Your loan dashboard and account overview'
            : 'Portfolio overview and metrics for microfinance operations'
        }
      />
      <meta
        name="keywords"
        content={
          isCustomer
            ? 'dashboard,loan,installment,account'
            : 'portfolio,loans,borrowers,microfinance,dashboard'
        }
      />

      {isCustomer ? <CustomerDashboardView /> : <PortfolioOverviewView />}
    </>
  );
}
