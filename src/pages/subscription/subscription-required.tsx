/**
 * Subscription Required Page
 * Bank admin sees this when subscription is inactive until they pay and refresh status.
 */

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { SubscriptionRequiredView } from 'src/sections/subscription/subscription-required-view';

export default function SubscriptionRequiredPage() {
  return (
    <>
      <Helmet>
        <title>Subscription required - {CONFIG.appName}</title>
      </Helmet>
      <SubscriptionRequiredView />
    </>
  );
}
