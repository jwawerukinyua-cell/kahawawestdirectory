import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  CreditCard,
  Filter,
  CheckCircle2,
  Building,
  PlusCircle,
  Megaphone,
  PhoneCall,
  SlidersHorizontal,
} from 'lucide-react';
import { Business, BusinessClaim, BusinessApplication, Category, CommunityFeedback, CommunityStory, CommunityUpdate } from './types';
import { SEED_50_BUSINESSES } from './data/businesses';
import { CATEGORIES } from './data/categories';
import { DEFAULT_OPENING_HOURS } from './data/defaultOpeningHours';
import {
  getStoredCommunityUpdates,
  saveCommunityUpdate,
  updateCommunityUpdateModeration,
  deleteCommunityUpdate,
  getDeletedUpdateIds,
  PURGED_UPDATE_IDS,
} from './data/communityUpdates';
import {
  getStoredCommunityStories,
  saveCommunityStory,
  updateStoryModeration,
  deleteCommunityStory,
  getDeletedStoryIds,
  INITIAL_COMMUNITY_STORIES,
} from './data/communityStories';
import {
  getStoredBusinesses,
  saveCustomizedBusiness,
  getStoredFeedback,
  syncStoryToSupabase,
  fetchStoriesFromSupabase,
  syncUpdateToSupabase,
  fetchUpdatesFromSupabase,
  getSavedClaims,
  saveBusinessClaim,
  fetchClaimsFromSupabase,
  updateClaimStatusInSupabase,
  deleteClaimFromSupabase,
  getStoredApplications,
  saveBusinessApplication,
  fetchApplicationsFromSupabase,
  updateApplicationStatusInSupabase,
  deleteApplicationFromSupabase,
  fetchBusinessesFromSupabase,
  generateBusinessSlug,
} from './lib/supabase';

// Layout & Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MobileZoneDrawer } from './components/places/MobileZoneDrawer';
import { Hero } from './components/home/Hero';
import { CategoryFilter } from './components/directory/CategoryFilter';
import { ZoneFilter } from './components/places/ZoneFilter';
import { SortDropdown } from './components/directory/SortDropdown';
import { EmptyState } from './components/directory/EmptyState';
import { BusinessCard } from './components/businesses/BusinessCard';
import { BusinessDetailModal } from './components/businesses/BusinessDetailModal';
import { EditBusinessModal } from './components/businesses/EditBusinessModal';
import { ClaimBusinessModal } from './components/businesses/ClaimBusinessModal';
import { ListYourBusinessModal } from './components/businesses/ListYourBusinessModal';
import { CommunityFeedbackModal } from './components/community/feedback/CommunityFeedbackModal';
import { CommunitySpotlight } from './components/community/spotlight/CommunitySpotlight';
import { CommunityUpdates } from './components/community/updates/CommunityUpdates';
import { SubmitUpdateModal } from './components/community/updates/SubmitUpdateModal';
import { StoryReaderModal } from './components/community/spotlight/StoryReaderModal';
import { SubmitStoryModal } from './components/community/spotlight/SubmitStoryModal';
import { EditorialReviewModal } from './components/community/spotlight/EditorialReviewModal';
import { EmergencyModal } from './components/EmergencyModal';
import { AboutModal } from './components/about/AboutModal';
import { LegalModal } from './components/legal/LegalModal';
import { MonetizationPlaceholders } from './components/home/MonetizationPlaceholders';
import { AdEnquiryModal } from './components/home/AdEnquiryModal';
import { FloatingShareButton } from './components/ui/FloatingShareButton';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { NotificationToast } from './components/notifications/NotificationToast';
import { InstallAppModal } from './components/pwa/InstallAppModal';
import { SitemapModal } from './components/seo/SitemapModal';
import { trackSearchQuery } from './lib/tracking';
import {
  AppNotification,
  getStoredNotifications,
  saveNotification,
  sendNativeNotification,
  generateSearchMatchAlerts,
} from './lib/notifications';

export default function App() {
  // 1. Core State
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    return getStoredBusinesses(SEED_50_BUSINESSES);
  });

  const [updates, setUpdates] = useState<CommunityUpdate[]>(() => getStoredCommunityUpdates());
  const [stories, setStories] = useState<CommunityStory[]>(() => getStoredCommunityStories());
  const [claims, setClaims] = useState<BusinessClaim[]>(() => getSavedClaims());
  const [applications, setApplications] = useState<BusinessApplication[]>(() => getStoredApplications());

  // 2. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [housingAgentsOnly, setHousingAgentsOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mpesaOnly, setMpesaOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name' | 'verified'>('rating');

  // 3. Modal & Drawer States
  const [selectedBusinessForDetails, setSelectedBusinessForDetails] = useState<Business | null>(null);
  const [selectedBusinessForEdit, setSelectedBusinessForEdit] = useState<Business | null>(null);
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false);
  const [businessToClaim, setBusinessToClaim] = useState<Business | null>(null);
  const [businessForFeedback, setBusinessForFeedback] = useState<Business | null>(null);
  const [selectedStoryForReading, setSelectedStoryForReading] = useState<CommunityStory | null>(null);
  const [isSubmitStoryOpen, setIsSubmitStoryOpen] = useState(false);
  const [isSubmitUpdateOpen, setIsSubmitUpdateOpen] = useState(false);
  const [isEditorialReviewOpen, setIsEditorialReviewOpen] = useState(false);
  const [isListBusinessOpen, setIsListBusinessOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileZoneOpen, setIsMobileZoneOpen] = useState(false);
  const [isAdEnquiryOpen, setIsAdEnquiryOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());
  const [activeToastNotification, setActiveToastNotification] = useState<AppNotification | null>(null);
  const [legalTab, setLegalTab] = useState<'guidelines' | 'community' | 'privacy' | 'terms' | null>(null);

  // Unread notification count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Keep notifications reactive
  useEffect(() => {
    const handleNotifUpdate = (e: any) => {
      if (e.detail) {
        setNotifications(e.detail);
      }
    };
    window.addEventListener('kwest_notifications_updated', handleNotifUpdate);

    return () => {
      window.removeEventListener('kwest_notifications_updated', handleNotifUpdate);
    };
  }, []);

  // Catch beforeinstallprompt globally as soon as App loads
  useEffect(() => {
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__kwestInstallPrompt = e;
      window.dispatchEvent(new CustomEvent('kwest_prompt_ready'));
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  // Fetch latest community stories, updates, claims, applications & businesses from Supabase on mount
  useEffect(() => {
    fetchStoriesFromSupabase().then((remoteStories) => {
      if (remoteStories && remoteStories.length > 0) {
        const deletedIds = getDeletedStoryIds();
        const activeRemote = remoteStories.filter(
          (s) =>
            !deletedIds.has(s.id) &&
            !s.id.startsWith('test-') &&
            s.id !== 'story-1788450086647' &&
            s.id !== 'story-02' &&
            s.id !== 'story-01' &&
            s.id !== 'story-03' &&
            (s.id === 'story-1788508956440' || s.id.startsWith('story-user-') || s.id.startsWith('story-'))
        );
        setStories((prev) => {
          const remoteMap = new Map(activeRemote.map((s) => [s.id, s]));
          return activeRemote.concat(
            prev.filter(
              (p) =>
                !remoteMap.has(p.id) &&
                !deletedIds.has(p.id) &&
                p.id !== 'story-1788450086647' &&
                p.id !== 'story-02' &&
                p.id !== 'story-01' &&
                p.id !== 'story-03' &&
                !p.id.startsWith('test-') &&
                (p.id === 'story-1788508956440' || p.id.startsWith('story-user-') || p.id.startsWith('story-'))
            )
          );
        });
      }
    });

    fetchUpdatesFromSupabase().then((remoteUpdates) => {
      if (remoteUpdates && remoteUpdates.length > 0) {
        const deletedIds = getDeletedUpdateIds();
        const activeRemote = remoteUpdates.filter(
          (u) =>
            !deletedIds.has(u.id) &&
            !PURGED_UPDATE_IDS.has(u.id) &&
            (u.id === 'up-iebc-voter-reg-2026' || u.id.startsWith('up-user-') || u.id.startsWith('update-'))
        );
        setUpdates((prev) => {
          const remoteMap = new Map(activeRemote.map((u) => [u.id, u]));
          return activeRemote.concat(
            prev.filter(
              (p) =>
                !remoteMap.has(p.id) &&
                !deletedIds.has(p.id) &&
                !PURGED_UPDATE_IDS.has(p.id) &&
                (p.id === 'up-iebc-voter-reg-2026' || p.id.startsWith('up-user-') || p.id.startsWith('update-'))
            )
          );
        });
      }
    });

    // Fetch latest claims from Supabase
    fetchClaimsFromSupabase().then((remoteClaims) => {
      if (remoteClaims && remoteClaims.length > 0) {
        setClaims(remoteClaims);
      }
    });

    // Fetch latest listing applications from Supabase
    fetchApplicationsFromSupabase().then((remoteApps) => {
      if (remoteApps && remoteApps.length > 0) {
        setApplications(remoteApps);
      }
    });

    // Fetch latest verified businesses from Supabase to sync across devices (laptop, mobile)
    fetchBusinessesFromSupabase().then((remoteBusinesses) => {
      if (remoteBusinesses && remoteBusinesses.length > 0) {
        setBusinesses((prev) => {
          const remoteMap = new Map(remoteBusinesses.map((b) => [b.id, b]));
          const updatedPrev = prev.map((p) => {
            if (remoteMap.has(p.id)) {
              return {
                ...p,
                ...remoteMap.get(p.id)!,
              };
            }
            return p;
          });
          const prevMap = new Map(updatedPrev.map((p) => [p.id, p]));
          const newVerifiedRemote = remoteBusinesses.filter(
            (b) => !prevMap.has(b.id) && b.isVerified === true
          );
          return [...updatedPrev, ...newVerifiedRemote];
        });
      }
    });
  }, []);

  // 3b. Businesses with active special resident offers
  const businessesWithOffers = useMemo(() => {
    return businesses.filter((b) => Boolean(b.specialOffer));
  }, [businesses]);

  // 4. Check URL hash, search query parameters & pathname for SEO deep linking (e.g. #slug, ?biz=, ?story=, ?view=)
  useEffect(() => {
    const handleUrlRoute = () => {
      // A. Query Param Parsing
      const searchParams = new URLSearchParams(window.location.search);
      const bizParam = searchParams.get('biz');
      const storyParam =
        searchParams.get('story') ||
        searchParams.get('storyId') ||
        searchParams.get('article') ||
        searchParams.get('s');
      const viewParam = searchParams.get('view');
      const catParam = searchParams.get('category');
      const zoneParam = searchParams.get('zone');

      // B. Pathname Parsing (e.g. /story/kahawa-pride-fc or /stories/story-02)
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      let storyFromPath: string | null = null;
      if (pathSegments.length > 0) {
        if (pathSegments[0] === 'story' || pathSegments[0] === 'stories') {
          storyFromPath = pathSegments[1] || null;
        }
      }

      if (catParam) {
        setSelectedCategory(catParam);
      }
      if (zoneParam) {
        setSelectedZone(zoneParam);
      }
      if (viewParam) {
        if (viewParam === 'sitemap') setIsSitemapOpen(true);
        else if (viewParam === 'emergency') setIsEmergencyOpen(true);
        else if (viewParam === 'list-business') setIsListBusinessOpen(true);
        else if (viewParam === 'promote') setIsAdEnquiryOpen(true);
        else if (viewParam === 'about') setIsAboutOpen(true);
        else if (viewParam === 'guidelines') setLegalTab('guidelines');
        else if (viewParam === 'community-standards') setLegalTab('community');
        else if (viewParam === 'privacy') setLegalTab('privacy');
        else if (viewParam === 'terms') setLegalTab('terms');
      }

      // 1. Story matching from query param (?story=...) or pathname (/story/...)
      const allStories = stories.length > 0 ? stories : INITIAL_COMMUNITY_STORIES;
      const targetStoryFromQueryOrPath = storyParam || storyFromPath;

      if (targetStoryFromQueryOrPath) {
        const targetStoryKey = decodeURIComponent(targetStoryFromQueryOrPath).toLowerCase().trim();
        const foundStory = allStories.find((s) => {
          const idMatch = s.id?.toLowerCase() === targetStoryKey;
          const slugMatch = s.slug?.toLowerCase() === targetStoryKey;
          const titleNormalized = s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const titleMatch =
            titleNormalized === targetStoryKey ||
            titleNormalized.includes(targetStoryKey) ||
            targetStoryKey.includes(titleNormalized);
          const fuzzyKahawaPride =
            (targetStoryKey.includes('kahawa-pride') ||
              targetStoryKey.includes('pride-fc') ||
              targetStoryKey.includes('pride') ||
              targetStoryKey.includes('soccer') ||
              targetStoryKey.includes('football') ||
              targetStoryKey.includes('1788508956440') ||
              targetStoryKey.includes('1788450086647') ||
              targetStoryKey.includes('1788342289836')) &&
            (s.id === 'story-1788508956440' || s.id === 'story-1788450086647' || s.id === 'story-1788342289836' || s.id === 'story-02' || s.slug?.includes('pride') || s.title.toLowerCase().includes('pride'));
          const fuzzyCongo =
            targetStoryKey.includes('congo') &&
            (s.id === 'story-01' || s.slug?.includes('congo') || s.title.toLowerCase().includes('congo'));
          const fuzzyJacaranda =
            targetStoryKey.includes('jacaranda') &&
            (s.id === 'story-03' || s.slug?.includes('jacaranda') || s.title.toLowerCase().includes('jacaranda'));

          return idMatch || slugMatch || titleMatch || fuzzyKahawaPride || fuzzyCongo || fuzzyJacaranda;
        });

        if (foundStory) {
          setSelectedStoryForReading(foundStory);
          return;
        }
      }

      // 2. Hash-based routing check (#story=... or #biz-slug or #story-02 or #kahawa-pride-fc)
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (rawHash) {
        const decodedHash = decodeURIComponent(rawHash).toLowerCase();

        // Check if hash matches any story (either explicit prefix or matching slug/id)
        const foundStoryFromHash = allStories.find((s) => {
          const cleanHash = decodedHash.replace(/^story=/, '');
          const idMatch = s.id?.toLowerCase() === cleanHash;
          const slugMatch = s.slug?.toLowerCase() === cleanHash;
          const titleNormalized = s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const titleMatch = titleNormalized === cleanHash || titleNormalized.includes(cleanHash);
          const fuzzyKahawaPride =
            (cleanHash.includes('pride') || cleanHash.includes('kahawa-pride') || cleanHash.includes('football') || cleanHash.includes('soccer') || cleanHash.includes('1788508956440') || cleanHash.includes('1788450086647') || cleanHash.includes('1788342289836')) &&
            (s.id === 'story-1788508956440' || s.id === 'story-1788450086647' || s.id === 'story-1788342289836' || s.id === 'story-02' || s.slug?.includes('pride') || s.title.toLowerCase().includes('pride'));
          const fuzzyCongo =
            cleanHash.includes('congo') &&
            (s.id === 'story-01' || s.slug?.includes('congo') || s.title.toLowerCase().includes('congo'));
          const fuzzyJacaranda =
            cleanHash.includes('jacaranda') &&
            (s.id === 'story-03' || s.slug?.includes('jacaranda') || s.title.toLowerCase().includes('jacaranda'));

          return idMatch || slugMatch || titleMatch || fuzzyKahawaPride || fuzzyCongo || fuzzyJacaranda;
        });

        if (foundStoryFromHash) {
          setSelectedStoryForReading(foundStoryFromHash);
          return;
        }

        // 3. Otherwise check business matching
        const targetBiz = (bizParam || decodedHash).toLowerCase().trim();
        if (targetBiz) {
          // 1. Direct slug or ID match
          let found = businesses.find(
            (b) => b.slug?.toLowerCase() === targetBiz || b.id?.toLowerCase() === targetBiz
          );

          // 2. Name-derived slug match
          if (!found) {
            found = businesses.find((b) => b.name && generateBusinessSlug(b.name) === targetBiz);
          }

          // 3. Fallback for Kimondo Tech, Bonata Cleaners, Bewai Transporters
          if (!found && (targetBiz.includes('kimondo') || targetBiz.includes('laptop-repair'))) {
            found = businesses.find(
              (b) => b.id === 'kw-biz-kimondo-tech' || b.slug?.includes('kimondo') || b.name.toLowerCase().includes('kimondo')
            );
          }
          if (!found && targetBiz.includes('bonata')) {
            found = businesses.find(
              (b) => b.id === 'kw-biz-bonata-cleaners' || b.slug?.includes('bonata') || b.name.toLowerCase().includes('bonata')
            );
          }
          if (!found && targetBiz.includes('bewai')) {
            found = businesses.find(
              (b) => b.id === 'kw-biz-bewai-transporters' || b.slug?.includes('bewai') || b.name.toLowerCase().includes('bewai')
            );
          }

          // 4. Fallback for seed business variants
          if (!found && (targetBiz.includes('furniture-crafts') || targetBiz.includes('furniture'))) {
            found = businesses.find(
              (b) =>
                b.category === 'hardware-construction' &&
                (b.subCategory?.toLowerCase().includes('furniture') ||
                  b.name.toLowerCase().includes('furniture') ||
                  b.name.toLowerCase().includes('ukweli'))
            );
          }

          if (found) {
            setSelectedBusinessForDetails(found);
            if (found.slug && window.location.hash.replace('#', '') !== found.slug && !bizParam) {
              window.history.replaceState(null, '', `#${found.slug}`);
            }
          }
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, [businesses, stories]);

  // 5. Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    businesses.forEach((b) => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });
    return counts;
  }, [businesses]);

  // 6. Zone Counts
  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    businesses.forEach((b) => {
      counts[b.zone] = (counts[b.zone] || 0) + 1;
    });
    return counts;
  }, [businesses]);

  // 7. Filtered and Sorted Businesses
  const filteredBusinesses = useMemo(() => {
    return businesses
      .filter((b) => {
        // Search query matching name, description, landmark, services, subCategory, tags
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = b.name.toLowerCase().includes(q);
          const matchesDesc = b.description.toLowerCase().includes(q);
          const matchesLandmark = b.landmark.toLowerCase().includes(q);
          const matchesZone = b.zone.toLowerCase().includes(q);
          const matchesSubCat = b.subCategory?.toLowerCase().includes(q);
          const matchesServices = b.services?.some((s) => s.toLowerCase().includes(q));

          if (!matchesName && !matchesDesc && !matchesLandmark && !matchesZone && !matchesSubCat && !matchesServices) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && b.category !== selectedCategory) {
          return false;
        }

        // Zone filter
        if (selectedZone !== 'all' && b.zone !== selectedZone) {
          return false;
        }

        // Housing & Rent Collecting Agents filter
        if (housingAgentsOnly && b.category !== 'home-rentals') {
          return false;
        }

        // Verified filter
        if (verifiedOnly && !b.isVerified && !b.isClaimed) {
          return false;
        }

        // M-Pesa filter
        if (mpesaOnly && !b.mpesa) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
        if (sortBy === 'reviews') return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        if (sortBy === 'verified') {
          if (a.isClaimed !== b.isClaimed) return a.isClaimed ? -1 : 1;
          if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
          return (b.rating ?? 0) - (a.rating ?? 0);
        }
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [businesses, searchQuery, selectedCategory, selectedZone, housingAgentsOnly, verifiedOnly, mpesaOnly, sortBy]);

  // Handlers for Businesses
  const handleViewDetails = (business: Business) => {
    setSelectedBusinessForDetails(business);
    window.history.replaceState(null, '', `#${business.slug}`);
  };

  const handleCloseDetails = () => {
    setSelectedBusinessForDetails(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleOpenEditBusiness = (business: Business) => {
    setSelectedBusinessForEdit(business);
    setIsEditBusinessOpen(true);
  };

  const handleBusinessUpdated = (updatedBusiness: Business) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === updatedBusiness.id ? updatedBusiness : b))
    );
    if (selectedBusinessForDetails?.id === updatedBusiness.id) {
      setSelectedBusinessForDetails(updatedBusiness);
      if (updatedBusiness.slug) {
        window.history.replaceState(null, '', `#${updatedBusiness.slug}`);
      }
    }
    saveCustomizedBusiness(updatedBusiness);
  };

  const handleClaimSubmitted = (claim: BusinessClaim) => {
    setClaims((prev) => {
      const filtered = prev.filter((c) => c.business_id !== claim.business_id && c.id !== claim.id);
      return [claim, ...filtered];
    });
    // The business stays strictly unverified and unclaimed in live directory until approved in Editorial Desk
  };

  const handleApplicationSubmitted = (application: BusinessApplication) => {
    setApplications((prev) => {
      const filtered = prev.filter((a) => a.id !== application.id);
      return [application, ...filtered];
    });
    // The new listing application stays strictly in pending queue until approved in Editorial Desk
  };

  const handleApproveClaim = async (businessId: string) => {
    await updateClaimStatusInSupabase(businessId, 'verified');
    const claimRecord = claims.find((c) => c.business_id === businessId || c.id === businessId);

    setClaims((prev) =>
      prev.map((c) =>
        c.business_id === businessId || c.id === businessId
          ? { ...c, status: 'verified' as const }
          : c
      )
    );

    setBusinesses((prev) => {
      return prev.map((b) => {
        if (b.id === businessId || b.slug === businessId) {
          const details = claimRecord?.claimed_details || {};
          const verifiedBiz: Business = {
            ...b,
            ...details,
            id: b.id,
            slug: b.slug,
            isVerified: true,
            isClaimed: true,
            claimedBy: claimRecord
              ? `${claimRecord.full_name} (${claimRecord.business_role || 'Owner'})`
              : b.claimedBy || 'Verified Owner',
            phone: claimRecord?.phone_number || details.phone || b.phone,
            whatsapp: claimRecord?.whatsapp_number || details.whatsapp || b.whatsapp,
            email: claimRecord?.email || details.email || b.email,
          };
          saveCustomizedBusiness(verifiedBiz);
          if (selectedBusinessForDetails?.id === b.id) {
            setSelectedBusinessForDetails(verifiedBiz);
          }
          return verifiedBiz;
        }
        return b;
      });
    });
  };

  const handleRejectClaim = async (businessId: string, reason?: string) => {
    await updateClaimStatusInSupabase(businessId, 'rejected');
    setClaims((prev) =>
      prev.map((c) =>
        c.business_id === businessId || c.id === businessId
          ? { ...c, status: 'rejected' as const, notes: reason ? `${c.notes || ''} [Rejected: ${reason}]` : c.notes }
          : c
      )
    );
  };

  const handleDeleteClaim = async (businessId: string) => {
    await deleteClaimFromSupabase(businessId);
    setClaims((prev) => prev.filter((c) => c.business_id !== businessId && c.id !== businessId));
  };

  const handleApproveApplication = async (app: BusinessApplication) => {
    await updateApplicationStatusInSupabase(app.id || '', 'approved');
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, status: 'approved' as const } : a))
    );

    // Convert approved application to fully verified and live directory Business
    const newBizId = `kw-biz-${Date.now()}`;
    const newSlug = generateBusinessSlug(app.name);
    const approvedBusiness: Business = {
      id: newBizId,
      slug: newSlug,
      name: app.name,
      tagline: `${app.category} in ${app.zone}, Kahawa West`,
      category: app.category,
      subCategory: app.subCategory,
      zone: app.zone,
      landmark: app.landmark,
      addressDetails: `${app.landmark}, ${app.zone}, Kahawa West`,
      phone: app.phone,
      whatsapp: app.whatsapp || app.phone,
      email: app.email,
      isVerified: true,
      isClaimed: true,
      claimedBy: `${app.applicantName} (${app.applicantRole || 'Owner'})`,
      rating: 5.0,
      reviewCount: 1,
      priceLevel: 'Moderate',
      heroImage: app.heroImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      galleryImages: app.galleryImages && app.galleryImages.length > 0 ? app.galleryImages : [app.heroImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'],
      description: app.description,
      services: app.services || [],
      features: ['Lipa na M-Pesa Available', 'Local Kahawa West Resident Owned', 'Verified Contact'],
      mpesa: app.mpesaNumber
        ? {
            type: (app.mpesaType as 'Till' | 'Pochi la Biashara' | 'Paybill' | 'Send Money') || 'Till',
            number: app.mpesaNumber,
            accountName: app.name.toUpperCase(),
          }
        : undefined,
      openingHours: DEFAULT_OPENING_HOURS,
      coordinates: { lat: -1.1850, lng: 36.8850 },
      createdAt: new Date().toISOString(),
    };

    await saveCustomizedBusiness(approvedBusiness);
    setBusinesses((prev) => [approvedBusiness, ...prev]);
  };

  const handleRejectApplication = async (appId: string, reason?: string) => {
    await updateApplicationStatusInSupabase(appId, 'rejected');
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? { ...a, status: 'rejected' as const, notes: reason ? `${a.notes || ''} [Rejected: ${reason}]` : a.notes }
          : a
      )
    );
  };

  const handleDeleteApplication = async (appId: string) => {
    await deleteApplicationFromSupabase(appId);
    setApplications((prev) => prev.filter((a) => a.id !== appId));
  };

  const handleToggleVerifyBusiness = async (business: Business) => {
    const updated: Business = {
      ...business,
      isVerified: !business.isVerified,
    };
    await saveCustomizedBusiness(updated);
    setBusinesses((prev) => prev.map((b) => (b.id === business.id ? updated : b)));
    if (selectedBusinessForDetails?.id === business.id) {
      setSelectedBusinessForDetails(updated);
    }
  };

  const handleBusinessAdded = (newBusiness: Business) => {
    setBusinesses((prev) => [newBusiness, ...prev]);
    setSelectedBusinessForDetails(newBusiness);
  };

  const handleClaimSuccess = (_updatedBusiness: Business, claim: BusinessClaim) => {
    handleClaimSubmitted(claim);
  };

  const handleFeedbackSubmitted = (feedback: CommunityFeedback) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === feedback.businessId) {
          const newReviewCount = b.reviewCount + 1;
          const newRating = Number(((b.rating * b.reviewCount + feedback.rating) / newReviewCount).toFixed(1));
          const updated = {
            ...b,
            rating: newRating,
            reviewCount: newReviewCount,
          };
          saveCustomizedBusiness(updated);
          return updated;
        }
        return b;
      })
    );
  };

  // Handlers for Stories
  const handleStorySubmitted = (newStory: CommunityStory) => {
    saveCommunityStory(newStory);
    syncStoryToSupabase(newStory);
    setStories((prev) => [newStory, ...prev.filter((s) => s.id !== newStory.id)]);
  };

  const handleApproveStory = (storyId: string, featured?: boolean) => {
    const updated = updateStoryModeration(storyId, 'published', featured);
    setStories(updated);
    const story = updated.find((s) => s.id === storyId);
    if (story) {
      syncStoryToSupabase(story);
    }
  };

  const handleRejectStory = (storyId: string, reason: string) => {
    const updated = updateStoryModeration(storyId, 'rejected', false, reason);
    setStories(updated);
    const story = updated.find((s) => s.id === storyId);
    if (story) {
      syncStoryToSupabase(story);
    }
  };

  const handleDeleteStory = (storyId: string) => {
    const updated = deleteCommunityStory(storyId);
    setStories(updated);
  };

  const handleUpdateStoryContent = (updatedStory: CommunityStory) => {
    saveCommunityStory(updatedStory);
    syncStoryToSupabase(updatedStory);
    setStories((prev) => prev.map((s) => (s.id === updatedStory.id ? updatedStory : s)));
  };

  const handleReadStory = (story: CommunityStory) => {
    setSelectedStoryForReading(story);
    const storyKey = story.slug || story.id;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('view', 'stories');
    searchParams.set('story', storyKey);
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, '', newUrl);
  };

  const handleCloseStoryReader = () => {
    setSelectedStoryForReading(null);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('story');
    searchParams.delete('storyId');
    searchParams.delete('article');
    if (searchParams.get('view') === 'stories') {
      searchParams.delete('view');
    }
    const newSearch = searchParams.toString();
    const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
    window.history.pushState(null, '', newUrl);
  };

  const handleLikeStory = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, likes: (s.likes || 0) + 1 } : s))
    );
  };

  const handleDislikeStory = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, dislikes: (s.dislikes || 0) + 1 } : s))
    );
  };

  // Handlers for Community Updates
  const handleUpdateSubmitted = (newUpdate: CommunityUpdate) => {
    saveCommunityUpdate(newUpdate);
    syncUpdateToSupabase(newUpdate);
    setUpdates(getStoredCommunityUpdates());

    const isUrgent = newUpdate.urgencyLevel === 'critical' || newUpdate.urgencyLevel === 'high' || newUpdate.type === 'alert';
    const notif: AppNotification = {
      id: `notif-update-${newUpdate.id}`,
      title: isUrgent
        ? `🚨 URGENT EMERGENCY POST: ${newUpdate.title}`
        : `📢 New Notice Submitted: ${newUpdate.title}`,
      body: `From ${newUpdate.author} (${newUpdate.authorPhone || 'No Phone'}). Pending editorial approval.`,
      type: 'update',
      time: 'Just now',
      badge: isUrgent ? 'Urgent Alert' : 'Pending Review',
      isRead: false,
      relatedZone: newUpdate.zone,
    };

    saveNotification(notif);
    setActiveToastNotification(notif);

    if (isUrgent) {
      sendNativeNotification(`🚨 EMERGENCY POST: ${newUpdate.title}`, {
        body: `Submitted by ${newUpdate.author} in ${newUpdate.location}. Open Editorial Desk to review.`,
      });
    }
  };

  const handleApproveUpdate = (updateId: string) => {
    const updated = updateCommunityUpdateModeration(updateId, 'published');
    setUpdates(updated);
    const item = updated.find((u) => u.id === updateId);
    if (item) {
      syncUpdateToSupabase(item);
    }
  };

  const handleRejectUpdate = (updateId: string, reason: string) => {
    const updated = updateCommunityUpdateModeration(updateId, 'rejected', reason);
    setUpdates(updated);
    const item = updated.find((u) => u.id === updateId);
    if (item) {
      syncUpdateToSupabase(item);
    }
  };

  const handleDeleteUpdate = (updateId: string) => {
    const updated = deleteCommunityUpdate(updateId);
    setUpdates(updated);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedZone('all');
    setHousingAgentsOnly(false);
    setVerifiedOnly(false);
    setMpesaOnly(false);
    setSortBy('rating');
  };

  const scrollToNoticeboard = () => {
    const el = document.getElementById('community-hub-section') || document.getElementById('community-spotlight-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToDirectory = () => {
    const el = document.getElementById('directory-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  const pendingCount =
    stories.filter((s) => s.status === 'pending_review').length +
    updates.filter((u) => u.status === 'pending_review').length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans antialiased text-stone-900 selection:bg-emerald-700 selection:text-white pb-16 md:pb-0">
      {/* 1. Header Navigation Bar */}
      <Header
        onListBusinessClick={() => setIsListBusinessOpen(true)}
        onAboutClick={() => setIsAboutOpen(true)}
        onNoticeboardClick={scrollToNoticeboard}
        onEmergencyClick={() => setIsEmergencyOpen(true)}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* 2. Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Top Scenic Hero Showcase featuring the Bypass Roundabout & Integrated Category Grid */}
        <Hero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onListBusinessClick={() => setIsListBusinessOpen(true)}
          onExploreClick={scrollToDirectory}
          businessCount={businesses.length}
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setTimeout(scrollToDirectory, 100);
          }}
          categoryCounts={categoryCounts}
        />

        {/* Monetization Slot & Special Resident Offers Coming Soon Placeholders */}
        <MonetizationPlaceholders
          businessesWithOffers={businessesWithOffers}
          onViewBusiness={handleViewDetails}
          onClaimListing={() => setIsListBusinessOpen(true)}
          onOpenAdEnquiry={() => setIsAdEnquiryOpen(true)}
        />

        {/* Directory Controls & Filtering Section */}
        <section id="directory-section" className="space-y-4 mb-8">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-black text-[#630303] tracking-tight">
                  {selectedCategory === 'all'
                    ? 'All Kahawa West Businesses'
                    : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Businesses'}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedZone === 'all' ? 'Across all estate zones' : `Filtered to ${selectedZone}`}
              </p>
            </div>

            {/* Sort & Quick Toggles */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Housing & Rent Collecting Agents Checkbox Filter */}
              <button
                id="filter-housing-agents-toggle"
                type="button"
                onClick={() => setHousingAgentsOnly(!housingAgentsOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 active:scale-95 cursor-pointer select-none ${
                  housingAgentsOnly
                    ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
                title="Filter only Housing & Rent Collecting Agents"
                role="checkbox"
                aria-checked={housingAgentsOnly}
              >
                <input
                  type="checkbox"
                  id="filter-housing-agents-checkbox"
                  checked={housingAgentsOnly}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-amber-600 border-stone-300 focus:ring-amber-500 cursor-pointer pointer-events-none"
                  aria-label="Filter only Housing & Rent Collecting Agents"
                />
                <Building className={`w-3.5 h-3.5 ${housingAgentsOnly ? 'text-amber-800' : 'text-stone-400'}`} />
                <span>Housing & Rent Collecting Agents</span>
              </button>

              {/* Verified Filter */}
              <button
                id="filter-verified-toggle"
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 active:scale-95 cursor-pointer select-none ${
                  verifiedOnly
                    ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
                title="Filter only Verified listings"
                role="checkbox"
                aria-checked={verifiedOnly}
              >
                <input
                  type="checkbox"
                  id="filter-verified-checkbox"
                  checked={verifiedOnly}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-emerald-600 border-stone-300 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                  aria-label="Filter only Verified listings"
                />
                <ShieldCheck className={`w-3.5 h-3.5 ${verifiedOnly ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span>Verified</span>
              </button>

              {/* M-Pesa Till Filter */}
              <button
                id="filter-mpesa-toggle"
                type="button"
                onClick={() => setMpesaOnly(!mpesaOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 active:scale-95 cursor-pointer select-none ${
                  mpesaOnly
                    ? 'bg-sky-100 border-sky-600 text-sky-950 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
                title="Filter only listings with M-Pesa Till"
                role="checkbox"
                aria-checked={mpesaOnly}
              >
                <input
                  type="checkbox"
                  id="filter-mpesa-checkbox"
                  checked={mpesaOnly}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-sky-600 border-stone-300 focus:ring-sky-500 cursor-pointer pointer-events-none"
                  aria-label="Filter only listings with M-Pesa Till"
                />
                <CreditCard className={`w-3.5 h-3.5 ${mpesaOnly ? 'text-sky-700' : 'text-stone-400'}`} />
                <span>M-Pesa Till</span>
              </button>

              <SortDropdown sortBy={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Category Filter Horizontal Scroll */}
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />

          {/* Estate Zone Filter Horizontal Scroll */}
          <ZoneFilter
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            zoneCounts={zoneCounts}
          />
        </section>

        {/* Business Grid / Listings */}
        {filteredBusinesses.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedZone={selectedZone}
            isHousingFilterActive={housingAgentsOnly}
            isVerifiedFilterActive={verifiedOnly}
            isMpesaFilterActive={mpesaOnly}
            onReset={handleResetFilters}
            onListBusiness={() => setIsListBusinessOpen(true)}
            onSelectSuggestion={(sug) => setSearchQuery(sug)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {filteredBusinesses.map((b) => (
              <BusinessCard
                key={b.id}
                business={b}
                onViewDetails={handleViewDetails}
                onClaim={(biz) => setBusinessToClaim(biz)}
              />
            ))}
          </div>
        )}

        {/* 3. UNIFIED COMMUNITY SECTION: Community Spotlight + Community Updates below it */}
        <section id="community-hub-section" className="space-y-12 mb-12">
          {/* A. Community Spotlight */}
          <CommunitySpotlight
            stories={stories.filter((s) => s.status === 'published' || !s.status)}
            onReadStory={handleReadStory}
            onSubmitStoryClick={() => setIsSubmitStoryOpen(true)}
            onOpenEditorialDesk={() => setIsEditorialReviewOpen(true)}
            pendingCount={pendingCount}
          />

          {/* B. Community Updates (Directly below Community Spotlight) */}
          <CommunityUpdates
            updates={updates.filter((u) => u.status === 'published' || !u.status)}
            onPostUpdateClick={() => setIsSubmitUpdateOpen(true)}
          />
        </section>
      </main>

      {/* 4. Footer */}
      <Footer
        onLegalClick={(tab) => setLegalTab(tab)}
        onAboutClick={() => setIsAboutOpen(true)}
        onListBusinessClick={() => setIsListBusinessOpen(true)}
        onInstallClick={() => setIsInstallAppOpen(true)}
      />

      {/* 5. Mobile Fixed Bottom Navigation */}
      <MobileBottomNav
        onSearchClick={scrollToDirectory}
        onZonesClick={() => setIsMobileZoneOpen(true)}
        onListBusinessClick={() => setIsListBusinessOpen(true)}
        onNoticeboardClick={scrollToNoticeboard}
        onEmergencyClick={() => setIsEmergencyOpen(true)}
      />

      {/* 5b. Floating Share KWEST Action Button */}
      <FloatingShareButton />

      {/* 6. Mobile Zone Selector Drawer */}
      <MobileZoneDrawer
        isOpen={isMobileZoneOpen}
        onClose={() => setIsMobileZoneOpen(false)}
        selectedZone={selectedZone}
        onSelectZone={(z) => setSelectedZone(z)}
        zoneCounts={zoneCounts}
      />

      {/* 7. Modals & Dialogs */}

      {/* Central Editorial Review & Approval Desk Modal */}
      <EditorialReviewModal
        isOpen={isEditorialReviewOpen}
        onClose={() => setIsEditorialReviewOpen(false)}
        stories={stories}
        updates={updates}
        claims={claims}
        applications={applications}
        businesses={businesses}
        onApproveStory={handleApproveStory}
        onRejectStory={handleRejectStory}
        onDeleteStory={handleDeleteStory}
        onUpdateStoryContent={handleUpdateStoryContent}
        onApproveUpdate={handleApproveUpdate}
        onRejectUpdate={handleRejectUpdate}
        onDeleteUpdate={handleDeleteUpdate}
        onApproveClaim={handleApproveClaim}
        onRejectClaim={handleRejectClaim}
        onDeleteClaim={handleDeleteClaim}
        onApproveApplication={handleApproveApplication}
        onRejectApplication={handleRejectApplication}
        onDeleteApplication={handleDeleteApplication}
        onEditBusiness={handleOpenEditBusiness}
        onToggleVerifyBusiness={handleToggleVerifyBusiness}
        onOpenSubmitModal={() => setIsSubmitStoryOpen(true)}
        onOpenSubmitUpdateModal={() => setIsSubmitUpdateOpen(true)}
      />

      {/* Community Spotlight Story Reader Modal */}
      <StoryReaderModal
        story={selectedStoryForReading}
        isOpen={Boolean(selectedStoryForReading)}
        onClose={handleCloseStoryReader}
        onLike={handleLikeStory}
        onDislike={handleDislikeStory}
      />

      {/* Submit Community Story Modal */}
      <SubmitStoryModal
        isOpen={isSubmitStoryOpen}
        onClose={() => setIsSubmitStoryOpen(false)}
        onStorySubmitted={handleStorySubmitted}
      />

      {/* Submit Community Update Modal (Alerts, Events, Business Openings, Community Drives) */}
      <SubmitUpdateModal
        isOpen={isSubmitUpdateOpen}
        onClose={() => setIsSubmitUpdateOpen(false)}
        onUpdateSubmitted={handleUpdateSubmitted}
      />

      {/* Business Full Detail Modal */}
      <BusinessDetailModal
        business={selectedBusinessForDetails}
        isOpen={Boolean(selectedBusinessForDetails)}
        onClose={handleCloseDetails}
        onClaimClick={(biz) => {
          setBusinessToClaim(biz);
        }}
        onEditClick={handleOpenEditBusiness}
        onLeaveFeedbackClick={(biz) => {
          setBusinessForFeedback(biz);
        }}
      />

      {/* Edit Business Modal (For Verified Owners / Claimed Listings & Editorial Desk) */}
      {isEditBusinessOpen && (
        <EditBusinessModal
          business={selectedBusinessForEdit}
          isOpen={isEditBusinessOpen}
          onClose={() => {
            setIsEditBusinessOpen(false);
            setSelectedBusinessForEdit(null);
          }}
          onBusinessUpdated={handleBusinessUpdated}
          isAdmin={true}
        />
      )}

      {/* Claim & Customize Business Modal */}
      {businessToClaim && (
        <ClaimBusinessModal
          business={businessToClaim}
          isOpen={Boolean(businessToClaim)}
          onClose={() => setBusinessToClaim(null)}
          onClaimSuccess={handleClaimSuccess}
          onClaimSubmitted={handleClaimSubmitted}
        />
      )}

      {/* List New Business Modal */}
      <ListYourBusinessModal
        isOpen={isListBusinessOpen}
        onClose={() => setIsListBusinessOpen(false)}
        onBusinessAdded={handleBusinessAdded}
        onApplicationSubmitted={handleApplicationSubmitted}
      />

      {/* Community Review / Feedback Modal */}
      {businessForFeedback && (
        <CommunityFeedbackModal
          business={businessForFeedback}
          isOpen={Boolean(businessForFeedback)}
          onClose={() => setBusinessForFeedback(null)}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}

      {/* Emergency Hotlines Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* About Kahawa West Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Legal & Community Guidelines Modal */}
      {legalTab && (
        <LegalModal
          tab={legalTab}
          isOpen={Boolean(legalTab)}
          onClose={() => setLegalTab(null)}
          onSelectTab={(t) => setLegalTab(t)}
        />
      )}

      {/* Ad Space & Sponsorship Enquiry Modal */}
      <AdEnquiryModal
        isOpen={isAdEnquiryOpen}
        onClose={() => setIsAdEnquiryOpen(false)}
      />

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        updates={updates}
      />

      {/* Real-time Notification Toast Notification */}
      <NotificationToast
        notification={activeToastNotification}
        onOpenCenter={() => setIsNotificationCenterOpen(true)}
        onDismiss={() => setActiveToastNotification(null)}
      />

      {/* PWA Home Screen Install App Modal with Official KWEST Logo */}
      <InstallAppModal
        isOpen={isInstallAppOpen}
        onClose={() => setIsInstallAppOpen(false)}
      />

      {/* SEO Sitemap & Robots.txt Webmaster Modal */}
      <SitemapModal
        isOpen={isSitemapOpen}
        onClose={() => setIsSitemapOpen(false)}
        businesses={businesses}
        stories={stories}
      />
    </div>
  );
}
