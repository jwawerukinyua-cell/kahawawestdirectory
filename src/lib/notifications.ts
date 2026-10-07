// KWEST PWA Notification Management & Dynamic Live Content Alerts
import { CommunityUpdate, CommunityStory } from '../types';

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

const READ_NOTIFICATIONS_STORAGE_KEY = 'kwest_read_notifications_ids_v2';
const PUSH_PREFERENCE_KEY = 'kwest_push_enabled_v1';

// Read IDs tracking from localStorage
export function getReadNotificationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function saveReadNotificationIds(ids: Set<string>): void {
  try {
    localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(ids)));
    window.dispatchEvent(new CustomEvent('kwest_notifications_updated'));
  } catch (e) {
    console.error('Error saving read notification ids:', e);
  }
}

// Build notifications ONLY from real, live, published content on the site
export function buildLiveNotifications(
  updates: CommunityUpdate[] = [],
  stories: CommunityStory[] = [],
  customReadIds?: Set<string>
): AppNotification[] {
  const readIds = customReadIds || getReadNotificationIds();
  const list: AppNotification[] = [];

  // 1. Real published updates (e.g. IEBC, emergency advisories, utility alerts)
  updates.forEach((u) => {
    const isLive =
      !u.status ||
      u.status === 'published' ||
      u.status === 'approved' ||
      (u.status as string) === 'approve';
    if (!isLive) return;

    const notifId = `up-${u.id}`;
    list.push({
      id: notifId,
      title: u.title,
      body: u.content.length > 130 ? u.content.slice(0, 130) + '...' : u.content,
      type: 'update',
      time: u.timeInfo || u.date || 'Recent',
      badge: u.badge || (u.type === 'business' ? 'Business Notice' : 'Community Alert'),
      url: `/?view=updates&update=${encodeURIComponent(u.id)}`,
      isRead: readIds.has(notifId),
      relatedZone: u.zone,
    });
  });

  // 2. Real published stories (e.g. El Niño readiness, grassroots features)
  stories.forEach((s) => {
    const isLive =
      !s.status ||
      s.status === 'published' ||
      s.status === 'approved' ||
      (s.status as string) === 'approve';
    if (!isLive) return;

    const notifId = `story-${s.id}`;
    list.push({
      id: notifId,
      title: s.title,
      body: s.excerpt || (s.content.length > 130 ? s.content.slice(0, 130) + '...' : s.content),
      type: 'update',
      time: s.date || 'Recent',
      badge: s.category || 'Spotlight Story',
      url: `/?view=stories&story=${encodeURIComponent(s.slug || s.id)}`,
      isRead: readIds.has(notifId),
      relatedZone: s.zone,
    });
  });

  return list;
}

// Get notifications based on stored data or fallback
export function getStoredNotifications(): AppNotification[] {
  return buildLiveNotifications();
}

export function saveNotification(_notif: AppNotification): AppNotification[] {
  return getStoredNotifications();
}

export function markAllNotificationsAsRead(notifications?: AppNotification[]): AppNotification[] {
  const readIds = getReadNotificationIds();
  const current = notifications || getStoredNotifications();
  current.forEach((n) => readIds.add(n.id));
  saveReadNotificationIds(readIds);
  return current.map((n) => ({ ...n, isRead: true }));
}

export function markNotificationAsRead(id: string): AppNotification[] {
  const readIds = getReadNotificationIds();
  readIds.add(id);
  saveReadNotificationIds(readIds);
  return getStoredNotifications();
}

export function clearNotifications(notifications?: AppNotification[]): AppNotification[] {
  return markAllNotificationsAsRead(notifications);
}

// Disabled dummy search echoing alerts
export function generateSearchMatchAlerts(_communityUpdates: CommunityUpdate[]): AppNotification | null {
  return null;
}

// Check notification permission state safely (handles sandboxed iframes & restricted browser contexts)
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    return Notification.permission;
  } catch (e) {
    // Sandboxed iframe or permission denied by document policy
    return 'unsupported';
  }
}

// Request permission and trigger Native PWA Notification
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    let currentPerm: string = 'default';
    try {
      currentPerm = Notification.permission;
    } catch {
      return false;
    }

    if (currentPerm === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    try {
      localStorage.setItem(PUSH_PREFERENCE_KEY, granted ? 'true' : 'false');
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return granted;
  } catch (err) {
    console.warn('Notification permission request unavailable in current context:', err);
    return false;
  }
}

// Send Native PWA Notification through Service Worker
export async function sendNativeNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    let perm: string = 'default';
    try {
      perm = Notification.permission;
    } catch {
      return false;
    }

    if (perm !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return false;
    }

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
    console.warn('Failed to trigger notification:', e);
    return false;
  }
}
