import { CONFIG } from 'src/config-global';

import { PortfolioOverviewView } from 'src/sections/portfolio/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Portfolio Overview - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Portfolio overview and metrics for microfinance operations"
      />
      <meta name="keywords" content="portfolio,loans,borrowers,microfinance,dashboard" />

      <PortfolioOverviewView />
    </>
  );
}
