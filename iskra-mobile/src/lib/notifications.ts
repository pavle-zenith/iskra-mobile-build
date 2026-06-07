import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  let { status } = await Notifications.getPermissionsAsync() as { status: string };

  if (status !== 'granted') {
    const result = await Notifications.requestPermissionsAsync() as { status: string };
    status = result.status;
  }

  if (status !== 'granted') return null;

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    return null;
  }
}

export async function savePushToken(userId: string, token: string) {
  await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', userId);
}
