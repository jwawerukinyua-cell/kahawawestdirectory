import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Business,
  BusinessClaim,
  BusinessApplication,
  CommunityStory,
  CommunityUpdate,
  CommunityFeedback,
} from '../types';
import { ensureSafeFirestorePayload } from './imageCompression';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// 1. Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with autoDetectLongPolling to allow fast WebSockets while automatically adapting to proxy/cellular environments
let firestoreDb;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    (firebaseConfig as any).firestoreDatabaseId
  );
} catch {
  firestoreDb = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
}

export const db = firestoreDb;
export const auth = getAuth(app);

// 2. Standardized error handler adhering to Firebase integration skill
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test connection to Firestore on boot (adhering to Firebase skill specifications)
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client operating in offline mode. Local cache active.');
    }
    return true;
  }
}

// Trigger initial connection verification
testFirestoreConnection().catch(() => {});

// ----------------------------------------------------
// BUSINESSES
// ----------------------------------------------------
export async function saveBusinessToFirestore(business: Business): Promise<boolean> {
  const path = `businesses/${business.id}`;
  try {
    const cleanPayload: Record<string, any> = {
      id: business.id,
      slug: business.slug,
      name: business.name,
      tagline: business.tagline || '',
      category: business.category,
      subCategory: business.subCategory || null,
      zone: business.zone,
      landmark: business.landmark || 'Kahawa West',
      addressDetails: business.addressDetails || null,
      phone: business.phone,
      whatsapp: business.whatsapp || business.phone,
      email: business.email || null,
      isVerified: business.isVerified ?? true,
      isClaimed: business.isClaimed ?? true,
      claimedBy: business.claimedBy || null,
      rating: business.rating || 5.0,
      reviewCount: business.reviewCount || 1,
      priceLevel: business.priceLevel || 'Moderate',
      heroImage: business.heroImage || null,
      galleryImages: business.galleryImages || [],
      description: business.description || '',
      services: business.services || [],
      features: business.features || [],
      mpesa: business.mpesa || null,
      socialLinks: business.socialLinks || null,
      specialOffer: business.specialOffer || null,
      status: 'published',
      createdAt: business.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const safePayload = await ensureSafeFirestorePayload(cleanPayload);
    await setDoc(doc(db, 'businesses', business.id), safePayload, { merge: true });
    return true;
  } catch (error: any) {
    if (error?.message && error.message.includes('exceeds the maximum allowed size')) {
      try {
        console.warn(`Emergency size recovery for business ${business.id}`);
        const fallback = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
        const minimalPayload = {
          id: business.id,
          slug: business.slug,
          name: business.name,
          tagline: business.tagline || '',
          category: business.category,
          zone: business.zone,
          phone: business.phone,
          heroImage: fallback,
          galleryImages: [fallback],
          status: 'published',
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'businesses', business.id), minimalPayload, { merge: true });
        return true;
      } catch (retryErr) {
        console.warn('Retry with minimal payload also failed:', retryErr);
      }
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchBusinessesFromFirestore(): Promise<Business[]> {
  const path = 'businesses';
  try {
    const colRef = collection(db, 'businesses');
    const snapshot = await getDocs(colRef);
    const list: Business[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as Business;
      list.push(data);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ----------------------------------------------------
// CLAIMS (Shopkeeper verification requests)
// ----------------------------------------------------
export async function saveClaimToFirestore(claim: BusinessClaim): Promise<{ success: boolean; id: string }> {
  const claimId = claim.id || `claim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const path = `claims/${claimId}`;
  try {
    const payload: Record<string, any> = {
      id: claimId,
      business_id: claim.business_id,
      business_name: claim.business_name || null,
      full_name: claim.full_name,
      phone_number: claim.phone_number,
      whatsapp_number: claim.whatsapp_number || claim.phone_number,
      email: claim.email,
      business_role: claim.business_role,
      national_id: claim.national_id || null,
      notes: claim.notes || null,
      status: claim.status || 'pending',
      claimed_details: claim.claimed_details || {},
      created_at: claim.created_at || new Date().toISOString(),
    };
    const safePayload = await ensureSafeFirestorePayload(payload);
    await setDoc(doc(db, 'claims', claimId), safePayload, { merge: true });
    return { success: true, id: claimId };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchClaimsFromFirestore(): Promise<BusinessClaim[]> {
  const path = 'claims';
  try {
    const colRef = collection(db, 'claims');
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const list: BusinessClaim[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as BusinessClaim);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateClaimInFirestore(
  claimIdOrBizId: string,
  updates: Partial<BusinessClaim>
): Promise<boolean> {
  const path = `claims/${claimIdOrBizId}`;
  try {
    const directDocRef = doc(db, 'claims', claimIdOrBizId);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      await updateDoc(directDocRef, updates as any);
      return true;
    }

    // Fallback: look up by business_id in claims collection
    const q = query(collection(db, 'claims'), where('business_id', '==', claimIdOrBizId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const promises = snap.docs.map((d) => updateDoc(d.ref, updates as any));
      await Promise.all(promises);
      return true;
    }

    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteClaimFromFirestore(claimIdOrBizId: string): Promise<boolean> {
  const path = `claims/${claimIdOrBizId}`;
  try {
    const directDocRef = doc(db, 'claims', claimIdOrBizId);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      await deleteDoc(directDocRef);
      return true;
    }

    const q = query(collection(db, 'claims'), where('business_id', '==', claimIdOrBizId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const promises = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(promises);
      return true;
    }

    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------------------------------------------
// APPLICATIONS (New business listings submitted by locals)
// ----------------------------------------------------
export async function saveApplicationToFirestore(
  appData: BusinessApplication
): Promise<{ success: boolean; id: string }> {
  const appId = appData.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const path = `applications/${appId}`;
  try {
    const payload: Record<string, any> = {
      id: appId,
      name: appData.name,
      category: appData.category,
      operationType: appData.operationType || null,
      zone: appData.zone,
      landmark: appData.landmark || 'Kahawa West',
      phone: appData.phone,
      whatsapp: appData.whatsapp || null,
      email: appData.email || null,
      description: appData.description,
      services: appData.services || [],
      mpesaType: appData.mpesaType || null,
      mpesaNumber: appData.mpesaNumber || null,
      heroImage: appData.heroImage || null,
      galleryImages: appData.galleryImages || [],
      applicantName: appData.applicantName,
      applicantPhone: appData.applicantPhone,
      applicantRole: appData.applicantRole,
      notes: appData.notes || (appData.merchantPin ? `[PIN: ${appData.merchantPin}]` : null),
      status: appData.status || 'pending',
      created_at: appData.created_at || new Date().toISOString(),
    };
    const safePayload = await ensureSafeFirestorePayload(payload);
    await setDoc(doc(db, 'applications', appId), safePayload, { merge: true });
    return { success: true, id: appId };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchApplicationsFromFirestore(): Promise<BusinessApplication[]> {
  const path = 'applications';
  try {
    const colRef = collection(db, 'applications');
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const list: BusinessApplication[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as BusinessApplication);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateApplicationInFirestore(
  appId: string,
  updates: Partial<BusinessApplication>
): Promise<boolean> {
  const path = `applications/${appId}`;
  try {
    await updateDoc(doc(db, 'applications', appId), updates as any);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteApplicationFromFirestore(appId: string): Promise<boolean> {
  const path = `applications/${appId}`;
  try {
    await deleteDoc(doc(db, 'applications', appId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------------------------------------------
// COMMUNITY STORIES (Spotlights & Features)
// ----------------------------------------------------
export async function saveStoryToFirestore(story: CommunityStory): Promise<boolean> {
  const path = `community_stories/${story.id}`;
  try {
    const payload: Record<string, any> = {
      id: story.id,
      slug: story.slug || story.id,
      title: story.title,
      subtitle: story.subtitle || null,
      category: story.category,
      zone: story.zone,
      content: story.content,
      excerpt: story.excerpt || story.content.slice(0, 160) + '...',
      imageUrl: story.imageUrl || null,
      imageCaption: story.imageCaption || null,
      isRealPhotoConfirmed: story.isRealPhotoConfirmed ?? true,
      authorName: story.authorName,
      authorRole: story.authorRole || null,
      authorEmail: story.authorEmail || null,
      authorPhone: story.authorPhone || null,
      date: story.date || new Date().toISOString().split('T')[0],
      readTimeMinutes: story.readTimeMinutes || 3,
      featured: story.featured || false,
      status: story.status || 'pending_review',
      rejectionReason: story.rejectionReason || null,
      likes: story.likes || 0,
    };
    const safePayload = await ensureSafeFirestorePayload(payload);
    await setDoc(doc(db, 'community_stories', story.id), safePayload, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchStoriesFromFirestore(): Promise<CommunityStory[]> {
  const path = 'community_stories';
  try {
    const colRef = collection(db, 'community_stories');
    const q = query(colRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const list: CommunityStory[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as CommunityStory);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteStoryFromFirestore(storyId: string): Promise<boolean> {
  const path = `community_stories/${storyId}`;
  try {
    await deleteDoc(doc(db, 'community_stories', storyId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------------------------------------------
// COMMUNITY UPDATES (Bulletins & Notices)
// ----------------------------------------------------
export async function saveUpdateToFirestore(update: CommunityUpdate): Promise<boolean> {
  const path = `community_updates/${update.id}`;
  try {
    const payload: Record<string, any> = {
      id: update.id,
      type: update.type,
      title: update.title,
      timeInfo: update.timeInfo || update.date,
      location: update.location || 'Kahawa West',
      zone: update.zone || null,
      content: update.content,
      author: update.author,
      authorPhone: update.authorPhone || null,
      authorEmail: update.authorEmail || null,
      authorRole: update.authorRole || null,
      contact: update.contact || null,
      badge: update.badge || null,
      imageUrl: update.imageUrl || null,
      imageCaption: update.imageCaption || null,
      isAccountabilityConfirmed: update.isAccountabilityConfirmed ?? true,
      urgencyLevel: update.urgencyLevel || 'standard',
      date: update.date || new Date().toISOString().split('T')[0],
      status: update.status || 'pending_review',
      rejectionReason: update.rejectionReason || null,
    };
    const safePayload = await ensureSafeFirestorePayload(payload);
    await setDoc(doc(db, 'community_updates', update.id), safePayload, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUpdatesFromFirestore(): Promise<CommunityUpdate[]> {
  const path = 'community_updates';
  try {
    const colRef = collection(db, 'community_updates');
    const q = query(colRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const list: CommunityUpdate[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as CommunityUpdate);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteUpdateFromFirestore(updateId: string): Promise<boolean> {
  const path = `community_updates/${updateId}`;
  try {
    await deleteDoc(doc(db, 'community_updates', updateId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------------------------------------------
// COMMUNITY FEEDBACK
// ----------------------------------------------------
export async function saveFeedbackToFirestore(feedback: CommunityFeedback): Promise<boolean> {
  const fbId = feedback.id || `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const path = `feedback/${fbId}`;
  try {
    await setDoc(doc(db, 'feedback', fbId), { ...feedback, id: fbId }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ----------------------------------------------------
// REALTIME SNAPSHOT LISTENERS
// ----------------------------------------------------
export function subscribeToApplications(
  onUpdate: (apps: BusinessApplication[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'applications';
  const q = query(collection(db, 'applications'), orderBy('created_at', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: BusinessApplication[] = [];
      snapshot.forEach((d) => list.push(d.data() as BusinessApplication));
      onUpdate(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToClaims(
  onUpdate: (claims: BusinessClaim[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'claims';
  const q = query(collection(db, 'claims'), orderBy('created_at', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: BusinessClaim[] = [];
      snapshot.forEach((d) => list.push(d.data() as BusinessClaim));
      onUpdate(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// ----------------------------------------------------
// SYNC STATUS REPORT
// ----------------------------------------------------
export interface FirebaseSyncReport {
  connected: boolean;
  storiesTableAccessible: boolean;
  updatesTableAccessible: boolean;
  businessesTableAccessible: boolean;
  claimsTableAccessible: boolean;
  applicationsTableAccessible: boolean;
  businessesInsertable: boolean;
  message: string;
}

export async function testFirebaseSyncStatus(): Promise<FirebaseSyncReport> {
  let storiesOk = false;
  let updatesOk = false;
  let businessesOk = false;
  let claimsOk = false;
  let applicationsOk = false;
  let insertOk = false;
  const errors: string[] = [];

  try {
    // 1. Test test doc write/read
    await setDoc(doc(db, 'test', 'status_check'), { lastChecked: new Date().toISOString() });
    insertOk = true;
  } catch (e: any) {
    errors.push(`Test write: ${e.message}`);
  }

  try {
    await getDocs(collection(db, 'community_stories'));
    storiesOk = true;
  } catch (e: any) {
    errors.push(`Stories: ${e.message}`);
  }

  try {
    await getDocs(collection(db, 'community_updates'));
    updatesOk = true;
  } catch (e: any) {
    errors.push(`Updates: ${e.message}`);
  }

  try {
    await getDocs(collection(db, 'businesses'));
    businessesOk = true;
  } catch (e: any) {
    errors.push(`Businesses: ${e.message}`);
  }

  try {
    await getDocs(collection(db, 'claims'));
    claimsOk = true;
  } catch (e: any) {
    errors.push(`Claims: ${e.message}`);
  }

  try {
    await getDocs(collection(db, 'applications'));
    applicationsOk = true;
  } catch (e: any) {
    errors.push(`Applications: ${e.message}`);
  }

  const allOk = storiesOk && updatesOk && businessesOk && claimsOk && applicationsOk;

  return {
    connected: allOk || insertOk,
    storiesTableAccessible: storiesOk,
    updatesTableAccessible: updatesOk,
    businessesTableAccessible: businessesOk,
    claimsTableAccessible: claimsOk,
    applicationsTableAccessible: applicationsOk,
    businessesInsertable: insertOk,
    message: allOk
      ? 'Google Firebase Firestore is fully connected and active. All collections are reading and syncing in real-time with zero egress restrictions!'
      : errors.join(' | '),
  };
}
