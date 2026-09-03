import { CommunityUpdate } from '../types';

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
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
    imageCaption: 'Pipe maintenance notice area on Kamiti Road feeder',
    isAccountabilityConfirmed: true,
    urgencyLevel: 'high',
    date: 'Tomorrow',
    status: 'published',
    badge: 'Alert',
    contact: '0700123456',
  },
  {
    id: 'up-02',
    type: 'event',
    title: 'Kahawa West Youth Football Tournament',
    timeInfo: 'Saturday • 10:00 AM',
    location: 'Kahawa West Grounds',
    zone: 'Station / Railway',
    content: 'Annual inter-estate youth championship featuring 8 local teams from Congo Stage, Jacaranda, Bima, and Soweto. Scouting coaches in attendance. Free entry for all estate residents with refreshments by local vendors.',
    author: 'Kahawa West Youth Sports Council',
    authorPhone: '+254722890123',
    authorEmail: 'sports@kahawawestdirectory.co.ke',
    authorRole: 'Community Organizer',
    imageUrl: '/kahawa-pride-real.jpg',
    imageCaption: 'Kahawa Pride FC and youth squad training at Mahiga grounds along Kamiti Road (Photo by Mfalme Ukweli)',
    isAccountabilityConfirmed: true,
    urgencyLevel: 'standard',
    date: 'Saturday',
    status: 'published',
    badge: 'Event',
    contact: '+254722890123',
  },
  {
    id: 'up-03',
    type: 'business',
    title: 'New Bakery Opening & Tasting',
    timeInfo: 'This Friday',
    location: 'Kamiti Road',
    zone: 'Kamiti Road',
    content: 'Grand opening of Crown Bakehouse opposite TotalEnergies on Kamiti Road. Fresh artisanal bread, sourdough loaves, birthday cakes, and freshly brewed Kahawa West coffee. Enjoy complimentary pastry tasting and meet the bakers!',
    author: 'Crown Bakehouse Management',
    authorPhone: '+254711445566',
    authorEmail: 'crownbakehouse@gmail.com',
    authorRole: 'Local Enterprise',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    imageCaption: 'Crown Bakehouse storefront along Kamiti Road',
    isAccountabilityConfirmed: true,
    urgencyLevel: 'standard',
    date: 'This Friday',
    status: 'published',
    badge: 'Civic Opening',
    contact: '+254711445566',
  },
  {
    id: 'up-04',
    type: 'community',
    title: 'Community Blood Donation Drive',
    timeInfo: 'Sunday • 8:00 AM',
    location: 'PCEA Kahawa West',
    zone: 'Jacaranda Estate',
    content: 'In partnership with Kenyatta National Hospital Blood Transfusion Unit and local healthcare volunteers. Come support our national blood banks and receive free basic health checkups (blood pressure & BMI screening).',
    author: 'PCEA Health & Welfare Committee',
    authorPhone: '+254720987654',
    authorEmail: 'pceakwest@gmail.com',
    authorRole: 'Welfare Committee Member',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    imageCaption: 'Mobile clinic setup at PCEA grounds',
    isAccountabilityConfirmed: true,
    urgencyLevel: 'standard',
    date: 'Sunday',
    status: 'published',
    badge: 'Community',
    contact: '+254720987654',
  },
  {
    id: 'up-05',
    type: 'alert',
    title: 'KPLC Scheduled Maintenance Notice for Bima & Soweto',
    timeInfo: 'Thursday • 9:00 AM - 5:00 PM',
    location: 'Bima Road & Soweto Feeder',
    zone: 'Bima Road',
    content: 'Kenya Power maintenance on the Bima distribution line to upgrade local transformer capacity and trim tree branches. Essential cyber cafes and welding hubs with generator backup remain operational.',
    author: 'K-West Estate Welfare Assoc.',
    authorPhone: '+254728556677',
    authorRole: 'Estate Welfare Elder',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80',
    imageCaption: 'Kenya Power grid upgrade section',
    isAccountabilityConfirmed: true,
    urgencyLevel: 'high',
    date: 'Thursday',
    status: 'published',
    badge: 'Utility Alert',
    contact: '+254728556677',
  },
  {
    id: 'up-06',
    type: 'community',
    title: 'Station Railway Green Corridor Clean-Up & Tree Planting',
    timeInfo: 'Next Saturday • 7:30 AM',
    location: 'Station / Railway Siding',
    zone: 'Station / Railway',
    content: 'Join youth champions, boda boda riders, and local traders in planting 200 indigenous tree seedlings and cleaning storm drains along Station Road before the rainy season.',
    author: 'Station Environment Youth',
    authorPhone: '+254733112233',
    authorRole: 'Youth Group Leader',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    imageCaption: 'Green planting corridor along Station Road',
    isAccountabilityConfirmed: true,
    urgencyLevel: 'standard',
    date: 'Next Saturday',
    status: 'published',
    badge: 'Community Action',
    contact: '+254733112233',
  },
];

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
        .filter((item: CommunityUpdate) => !deletedIds.has(item.id))
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
    const current = getStoredCommunityUpdates();
    const updated = current.filter((u) => u.id !== updateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getStoredCommunityUpdates();
  }
}
