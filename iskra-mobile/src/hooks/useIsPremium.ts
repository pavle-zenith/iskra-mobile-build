import { useState, useEffect } from 'react';
import { getCustomerInfo, isEntitlementActive } from '../lib/revenuecat';

export function useIsPremium(profileIsPremium?: boolean): boolean {
  const [rcPremium, setRcPremium] = useState<boolean>(false);

  useEffect(() => {
    getCustomerInfo()
      .then((info) => setRcPremium(isEntitlementActive(info)))
      .catch(() => {});
  }, []);

  // Trust Supabase flag if set, or live RC check
  return profileIsPremium === true || rcPremium;
}
