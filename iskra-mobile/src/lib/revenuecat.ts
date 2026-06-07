import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// RevenueCat API key — iOS only for now (add Android key when available)
const RC_API_KEY_IOS = 'test_bPeWvJlIOhmGgbcIBPHHtspjXPz';
const RC_API_KEY_ANDROID = 'test_bPeWvJlIOhmGgbcIBPHHtspjXPz';

export const ENTITLEMENT_ID = 'ISKRA Club';

export function configureRevenueCat(userId?: string) {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
  Purchases.configure({ apiKey, appUserID: userId ?? null });
}

export async function identifyUser(userId: string) {
  await Purchases.logIn(userId);
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export function isEntitlementActive(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID]?.isActive === true;
}

export async function getOfferings() {
  return Purchases.getOfferings();
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<{ customerInfo: CustomerInfo; cancelled: boolean }> {
  const result = await Purchases.purchasePackage(pkg);
  return { customerInfo: result.customerInfo, cancelled: false };
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

// After a successful purchase, mark the user premium in Supabase
export async function syncPremiumToSupabase(userId: string) {
  await supabase.from('profiles').update({ is_premium: true }).eq('id', userId);
}
