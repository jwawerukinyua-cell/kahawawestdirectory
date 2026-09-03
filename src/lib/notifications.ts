// KWEST PWA Notification Management & Service Worker Integration
import { CommunityUpdate } from '../types';
import { getRecentSearches } from './tracking';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'update' | 'search_match' | 'system' | 'deal';
  time: string;
  badge?: string;
  url?: string;
  isRead: boolean;
  relatedZone?: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'kwest_in_app_notifications_v1';
const PUSH_PREFERENCE_KEY = 'kwest_push_enabled_v1';

// Seed initial in-app community alerts
const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    title: '⚡ Power Notice for Bima & Soweto',
    body: 'Scheduled KPLC transformer maintenance on Thursday 9:00 AM - 5:00 PM.',
    type: 'update',
    time: '2 hours ago',
    badge: 'Utility Alert',
    isRead: false,
    relatedZone: 'Bima Road',
  },
  {
    id: 'notif-02',
    title: '🥐 Crown Bakehouse Grand Opening',
    body: 'Fresh bakery opening this Friday opposite TotalEnergies on Kamiti Road with 15% discount!',
    type: 'deal',
    time: '5 hours ago',
    badge: 'New Opening',
    isRead: false,
    relatedZone: 'Kamiti Road',
  },
  {
    id: 'notif-03',
    title: '⚽ Youth Football Tournament Saturday',
    body: 'Annual inter-estate championship kicking off 10:00 AM at Kahawa West Grounds. Free entry!',
    type: 'update',
    time: '1 day ago',
    badge: 'Community Event',
    isRead: true,
    relatedZone: 'Station / Railway',
  },
];

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading notifications:', e);
  }

  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
  } catch (e) {
    console.error(e);
  }
  return SEED_NOTIFICATIONS;
}

export function saveNotification(notif: AppNotification): AppNotification[] {
  const current = getStoredNotifications();
  const exists = current.some((n) => n.id === notif.id);
  const updated = exists ? current.map((n) => (n.id === notif.id ? notif : n)) : [notif, ...current];

  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_notifications_updated', { detail: updated }));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function markAllNotificationsAsRead(): AppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, isRead: true }));
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_notifications_updated', { detail: updated }));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function markNotificationAsRead(id: string): AppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_notifications_updated', { detail: updated }));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function clearNotifications(): AppNotification[] {
  try {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('kwest_notifications_updated', { detail: [] }));
  } catch (e) {
    console.error(e);
  }
  return [];
}

// Smart contextual alerts - search term alerts disabled per user specification
export function generateSearchMatchAlerts(_communityUpdates: CommunityUpdate[]): AppNotification | null {
  // Disabled: Do not echo search words (e.g. Bima) into the notification center
  return null;
}

// Check notification permission state
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request permission and trigger Native PWA Notification
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    localStorage.setItem(PUSH_PREFERENCE_KEY, granted ? 'true' : 'false');
    return granted;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

// Send Native PWA Notification through Service Worker
export async function sendNativeNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          icon: '/kwest-icon.png',
          badge: '/kwest-icon.png',
          ...options,
        } as NotificationOptions);
        return true;
      }
    }

    // Fallback to standard Window notification
    new Notification(title, {
      icon: '/kwest-icon.png',
      ...options,
    });
    return true;
  } catch (e) {
    console.error('Failed to trigger notification:', e);
    return false;
  }
}
