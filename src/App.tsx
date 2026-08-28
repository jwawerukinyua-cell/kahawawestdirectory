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
import { Business, BusinessClaim, Category, CommunityFeedback, CommunityStory, CommunityUpdate } from './types';
import { SEED_50_BUSINESSES } from './data/businesses';
import { CATEGORIES } from './data/categories';
import {
  getStoredCommunityUpdates,
  saveCommunityUpdate,
  updateCommunityUpdateModeration,
  deleteCommunityUpdate,
} from './data/communityUpdates';
import {
  getStoredCommunityStories,
  saveCommunityStory,
  updateStoryModeration,
  deleteCommunityStory,
} from './data/communityStories';
import {
  getStoredBusinesses,
  saveCustomizedBusiness,
  getStoredFeedback,
  syncStoryToSupabase,
  getSavedClaims,
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
import { AdminAnalyticsModal } from './components/admin/AdminAnalyticsModal';
import { InstallAppModal } from './components/pwa/InstallAppModal';
import { trackSearchQuery } from './lib/tracking';
import {
  AppNotification,
  getStoredNotifications,
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

  // 2. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
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
  const [isAdminAnalyticsOpen, setIsAdminAnalyticsOpen] = useState(false);
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);
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

    // Initial toast notification preview after 3.5 seconds
    const timer = setTimeout(() => {
      const all = getStoredNotifications();
      const unread = all.find((n) => !n.isRead);
      if (unread) {
        setActiveToastNotification(unread);
      }
    }, 3500);

    return () => {
      window.removeEventListener('kwest_notifications_updated', handleNotifUpdate);
      clearTimeout(timer);
    };
  }, []);

  // Automatic trigger: show install prompt & instructions when someone visits the site
  useEffect(() => {
    const isAppStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // Trigger prompt on each visit if not already launched in standalone mode
    if (!isAppStandalone) {
      const promptTimer = setTimeout(() => {
        setIsInstallAppOpen(true);
      }, 1200);

      return () => clearTimeout(promptTimer);
    }
  }, []);

  // Track search queries and check for matching community notices
  useEffect(() => {
    if (searchQuery.trim().length >= 3 || selectedZone !== 'all' || selectedCategory !== 'all') {
      const timeout = setTimeout(() => {
        trackSearchQuery(searchQuery, selectedZone, selectedCategory);
        const match = generateSearchMatchAlerts(updates);
        if (match) {
          setActiveToastNotification(match);
        }
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery, selectedZone, selectedCategory, updates]);


  // 3b. Businesses with active special resident offers
  const businessesWithOffers = useMemo(() => {
    return businesses.filter((b) => Boolean(b.specialOffer));
  }, [businesses]);

  // 4. Check URL hash on load for deep linking (e.g. #slug or ?id=)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '');
      if (rawHash) {
        const hash = decodeURIComponent(rawHash).toLowerCase().trim();
        // 1. Direct slug or ID match
        let found = businesses.find((b) => b.slug?.toLowerCase() === hash || b.id?.toLowerCase() === hash);

        // 2. Name-derived slug match
        if (!found) {
          found = businesses.find(
            (b) => b.name && generateBusinessSlug(b.name) === hash
          );
        }

        // 3. Fallback for seed business variants (e.g. #kahawa-west-furniture-crafts when renamed to Ukweli Furniture Crafts)
        if (!found && (hash.includes('furniture-crafts') || hash.includes('furniture'))) {
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
          // If the URL had an outdated hash or legacy alias, adapt to the current active slug
          if (found.slug && rawHash !== found.slug) {
            window.history.replaceState(null, '', `#${found.slug}`);
          }
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [businesses]);

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
  }, [businesses, searchQuery, selectedCategory, selectedZone, verifiedOnly, mpesaOnly, sortBy]);

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

  const handleClaimSuccess = (updatedBusiness: Business, claim: BusinessClaim) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === updatedBusiness.id ? updatedBusiness : b))
    );
    setClaims((prev) => {
      const filtered = prev.filter((c) => c.business_id !== claim.business_id);
      return [claim, ...filtered];
    });
    if (selectedBusinessForDetails?.id === updatedBusiness.id) {
      setSelectedBusinessForDetails(updatedBusiness);
      if (updatedBusiness.slug) {
        window.history.replaceState(null, '', `#${updatedBusiness.slug}`);
      }
    }
  };

  const handleApproveClaim = (businessId: string) => {
    setClaims((prev) => {
      const updated = prev.map((c) =>
        c.business_id === businessId ? { ...c, status: 'verified' as const } : c
      );
      try {
        localStorage.setItem('kwest_directory_claims', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, isClaimed: true } : b))
    );
  };

  const handleRejectClaim = (businessId: string, reason?: string) => {
    setClaims((prev) => {
      const updated = prev.map((c) =>
        c.business_id === businessId
          ? { ...c, status: 'rejected' as const, notes: reason ? `${c.notes || ''} [Rejected: ${reason}]` : c.notes }
          : c
      );
      try {
        localStorage.setItem('kwest_directory_claims', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteClaim = (businessId: string) => {
    setClaims((prev) => {
      const updated = prev.filter((c) => c.business_id !== businessId);
      try {
        localStorage.setItem('kwest_directory_claims', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleBusinessAdded = (newBusiness: Business) => {
    setBusinesses((prev) => [newBusiness, ...prev]);
    setSelectedBusinessForDetails(newBusiness);
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

  const handleLikeStory = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, likes: (s.likes || 0) + 1 } : s))
    );
  };

  // Handlers for Community Updates
  const handleUpdateSubmitted = (newUpdate: CommunityUpdate) => {
    saveCommunityUpdate(newUpdate);
    setUpdates(getStoredCommunityUpdates());
  };

  const handleApproveUpdate = (updateId: string) => {
    const updated = updateCommunityUpdateModeration(updateId, 'published');
    setUpdates(updated);
  };

  const handleRejectUpdate = (updateId: string, reason: string) => {
    const updated = updateCommunityUpdateModeration(updateId, 'rejected', reason);
    setUpdates(updated);
  };

  const handleDeleteUpdate = (updateId: string) => {
    const updated = deleteCommunityUpdate(updateId);
    setUpdates(updated);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedZone('all');
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
          onExploreClick={scrollToSearch}
          businessCount={businesses.length}
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
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
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 active:scale-95 ${
                  verifiedOnly
                    ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${verifiedOnly ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span>Verified</span>
              </button>

              <button
                onClick={() => setMpesaOnly(!mpesaOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 active:scale-95 ${
                  mpesaOnly
                    ? 'bg-sky-100 border-sky-600 text-sky-950 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
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
            onReset={handleResetFilters}
            onListBusiness={() => setIsListBusinessOpen(true)}
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
            onReadStory={(story) => setSelectedStoryForReading(story)}
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
      />

      {/* 5. Mobile Fixed Bottom Navigation */}
      <MobileBottomNav
        onSearchClick={scrollToSearch}
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
        onEditBusiness={handleOpenEditBusiness}
        onOpenSubmitModal={() => setIsSubmitStoryOpen(true)}
        onOpenSubmitUpdateModal={() => setIsSubmitUpdateOpen(true)}
      />

      {/* Community Spotlight Story Reader Modal */}
      <StoryReaderModal
        story={selectedStoryForReading}
        isOpen={Boolean(selectedStoryForReading)}
        onClose={() => setSelectedStoryForReading(null)}
        onLike={handleLikeStory}
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
        />
      )}

      {/* List New Business Modal */}
      <ListYourBusinessModal
        isOpen={isListBusinessOpen}
        onClose={() => setIsListBusinessOpen(false)}
        onBusinessAdded={handleBusinessAdded}
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

      {/* Internal Admin Business Intelligence & Ad Placement Lead Tracker */}
      <AdminAnalyticsModal
        isOpen={isAdminAnalyticsOpen}
        onClose={() => setIsAdminAnalyticsOpen(false)}
        businesses={businesses}
        onSelectBusiness={(biz) => {
          setIsAdminAnalyticsOpen(false);
          setSelectedBusinessForDetails(biz);
        }}
      />

      {/* PWA Home Screen Install App Modal with Official KWEST Logo */}
      <InstallAppModal
        isOpen={isInstallAppOpen}
        onClose={() => setIsInstallAppOpen(false)}
      />
    </div>
  );
}
