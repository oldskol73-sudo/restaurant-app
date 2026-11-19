import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Push alerts ("your order is ready") for when the customer's app is closed.
 * Everything here fails quietly: if push isn't available (web, Expo Go on Android,
 * no EAS project id, permission refused) the in-app alert still works.
 */

const projectId: string | undefined =
  (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ??
  (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;

/** Shows alerts while the app is open, too. */
export function setupNotificationHandler() {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Asks permission and returns this phone's push address, or null if unavailable. */
export async function registerForPush(): Promise<string | null> {
  try {
    if (Platform.OS === 'web' || !projectId) return null;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Order alerts',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return null;
    const token = await Promise.race([
      Notifications.getExpoPushTokenAsync({ projectId }),
      new Promise<null>((r) => setTimeout(() => r(null), 6000)),
    ]);
    return token ? token.data : null;
  } catch {
    return null;
  }
}

/** Staff phone → customer phone, through Expo's free push service. */
export async function sendPush(to: string, title: string, body: string, data: Record<string, unknown> = {}) {
  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ to, title, body, sound: 'default', channelId: 'default', priority: 'high', data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Calls `onOpen(orderId)` when the customer taps an order alert. */
export function listenForTaps(onOpen: (orderId: string) => void) {
  if (Platform.OS === 'web') return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    const id = (r.notification.request.content.data as { orderId?: string } | undefined)?.orderId;
    if (id) onOpen(id);
  });
  return () => sub.remove();
}
