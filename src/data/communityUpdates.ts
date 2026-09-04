import { CommunityUpdate } from '../types';
import { deleteUpdateFromSupabase } from '../lib/supabase';

export const SEED_COMMUNITY_UPDATES: CommunityUpdate[] = [
  {
    id: 'up-iebc-voter-reg-2026',
    type: 'business',
    title: '🗳️ Voter Registration Update — Kahawa West',
    timeInfo: '09-04-2026',
    location: 'Kahawa West',
    zone: 'Kamiti Road',
    content: `Are you 18 or older and not yet registered as a voter?

Voter registration is available through the IEBC as Kenya prepares for the 2027 General Election.

Residents of Kahawa West can visit the relevant IEBC registration office or centre to register, transfer their vote, or update their voter details.

📍 Kahawa West — Roysambu Constituency

Before heading out, confirm the current registration arrangements with IEBC.

Your vote is your voice. Make sure it counts.

Official IEBC information: IEBC Voter Registration https://www.iebc.or.ke/

Submitted by
James Kinyua
(Local Resident / Neighbor)
Call 0764405842`,
    author: 'James Kinyua',
    authorPhone: '0764405842',
    authorEmail: 'ukweliproducts@gmail.com',
    authorRole: 'Local Resident / Neighbor',
    imageUrl: '/iebc-logo.png',
    imageCaption: 'Independent Electoral and Boundaries Commission (IEBC) voter registration notice',
    isAccountabilityConfirmed: true,
    urgencyLevel: 'standard',
    date: '09-04-2026',
    status: 'published',
    badge: 'Public Notice',
    contact: '0764405842',
  },
];

export const PURGED_UPDATE_IDS = new Set(['up-01', 'up-02', 'up-03', 'up-04', 'up-05', 'up-06']);

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
      const seenIds = new Set<string>();
      const result: CommunityUpdate[] = [];

      for (const item of parsed) {
        if (deletedIds.has(item.id) || PURGED_UPDATE_IDS.has(item.id)) continue;
        if (seedMap.has(item.id)) {
          const seed = seedMap.get(item.id)!;
          result.push({
            ...item,
            ...seed,
            imageUrl: seed.imageUrl || item.imageUrl,
            imageCaption: seed.imageCaption || item.imageCaption,
          });
        } else {
          result.push(item);
        }
        seenIds.add(item.id);
      }

      for (const init of SEED_COMMUNITY_UPDATES) {
        if (!seenIds.has(init.id) && !deletedIds.has(init.id)) {
          result.push(init);
        }
      }

      return result.length > 0 ? result : SEED_COMMUNITY_UPDATES.filter((u) => !deletedIds.has(u.id));
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
