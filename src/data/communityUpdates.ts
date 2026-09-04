import { CommunityUpdate } from '../types';
import { deleteUpdateFromSupabase } from '../lib/supabase';

export const SEED_COMMUNITY_UPDATES: CommunityUpdate[] = [
  {
    id: 'up-01',
    type: 'alert',
    title: 'Scheduled Water Interruption',
    timeInfo: 'Tomorrow • 9:00 AM - 4:00 PM',
    location: 'Kahawa West',
    zone: 'Kamiti Road',
    content: 'Nairobi City Water and Sewerage Company routine maintenance along the main Kamiti Road pipeline feeder. Low water pressure is anticipated in parts of Jacaranda and Roundabout. Residents are advised to store adequate water.',
    author: 'NCWSC Area Liaison',
    authorPhone: '+254700123456',
    authorEmail: 'watercare@nairobiwater.co.ke',
    authorRole: 'Public Utility Officer',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    imageCaption: 'Pipe maintenance notice area on Kamiti Road feeder',
    isAccountabilityConfirmed: true,
    urgencyLevel: 'high',
    date: 'Tomorrow',
    status: 'published',
    badge: 'Alert',
    contact: '0700123456',
  },
];

export const PURGED_UPDATE_IDS = new Set(['up-02', 'up-03', 'up-04', 'up-05', 'up-06']);

export const COMMUNITY_UPDATES = SEED_COMMUNITY_UPDATES;

const STORAGE_KEY = 'kwest_community_updates_v1';
const DELETED_UPDATES_KEY = 'kwest_deleted_update_ids_v1';

export function getDeletedUpdateIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_UPDATES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markUpdateAsDeleted(updateId: string): void {
  try {
    const set = getDeletedUpdateIds();
    set.add(updateId);
    localStorage.setItem(DELETED_UPDATES_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function getStoredCommunityUpdates(): CommunityUpdate[] {
  try {
    const deletedIds = getDeletedUpdateIds();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const filteredSeed = SEED_COMMUNITY_UPDATES.filter((u) => !deletedIds.has(u.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSeed));
      return filteredSeed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const seedMap = new Map(SEED_COMMUNITY_UPDATES.map((u) => [u.id, u]));
      return parsed
        .filter((item: CommunityUpdate) => !deletedIds.has(item.id) && !PURGED_UPDATE_IDS.has(item.id))
        .map((item: CommunityUpdate) => {
          if (seedMap.has(item.id)) {
            const seed = seedMap.get(item.id)!;
            return {
              ...item,
              ...seed,
              imageUrl: seed.imageUrl || item.imageUrl,
              imageCaption: seed.imageCaption || item.imageCaption,
            };
          }
          return item;
        });
    }
    return SEED_COMMUNITY_UPDATES.filter((u) => !deletedIds.has(u.id));
  } catch {
    return SEED_COMMUNITY_UPDATES;
  }
}

export function saveCommunityUpdate(update: CommunityUpdate): void {
  try {
    const current = getStoredCommunityUpdates();
    const existingIndex = current.findIndex((u) => u.id === update.id);
    let updated: CommunityUpdate[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = update;
    } else {
      updated = [update, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist community update:', err);
  }
}

export function updateCommunityUpdateModeration(
  updateId: string,
  status: 'published' | 'pending_review' | 'rejected',
  rejectionReason?: string
): CommunityUpdate[] {
  try {
    const current = getStoredCommunityUpdates();
    const updated = current.map((u) => {
      if (u.id === updateId) {
        return {
          ...u,
          status,
          rejectionReason: rejectionReason || u.rejectionReason,
        };
      }
      return u;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getStoredCommunityUpdates();
  }
}

export function deleteCommunityUpdate(updateId: string): CommunityUpdate[] {
  try {
    markUpdateAsDeleted(updateId);
    deleteUpdateFromSupabase(updateId).catch(() => {});
    const current = getStoredCommunityUpdates();
    const updated = current.filter((u) => u.id !== updateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getStoredCommunityUpdates();
  }
}
