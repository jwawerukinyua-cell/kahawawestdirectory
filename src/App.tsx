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
import { COMMUNITY_UPDATES } from './data/communityUpdates';
import { getStoredCommunityStories, saveCommunityStory } from './data/communityStories';
import { getStoredBusinesses, saveCustomizedBusiness, getStoredFeedback } from './lib/supabase';

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
import { ClaimBusinessModal } from './components/businesses/ClaimBusinessModal';
import { ListYourBusinessModal } from './components/businesses/ListYourBusinessModal';
import { CommunityFeedbackModal } from './components/community/feedback/CommunityFeedbackModal';
import { CommunitySpotlight } from './components/community/spotlight/CommunitySpotlight';
import { StoryReaderModal } from './components/community/spotlight/StoryReaderModal';
import { SubmitStoryModal } from './components/community/spotlight/SubmitStoryModal';
import { EmergencyModal } from './components/EmergencyModal';
import { AboutModal } from './components/about/AboutModal';
import { LegalModal } from './components/legal/LegalModal';

export default function App() {
  // 1. Core State
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    return getStoredBusinesses(SEED_50_BUSINESSES);
  });

  const [updates, setUpdates] = useState<CommunityUpdate[]>(COMMUNITY_UPDATES);
  const [stories, setStories] = useState<CommunityStory[]>(() => getStoredCommunityStories());

  // 2. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mpesaOnly, setMpesaOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name' | 'verified'>('rating');

  // 3. Modal & Drawer States
  const [selectedBusinessForDetails, setSelectedBusinessForDetails] = useState<Business | null>(null);
  const [businessToClaim, setBusinessToClaim] = useState<Business | null>(null);
  const [businessForFeedback, setBusinessForFeedback] = useState<Business | null>(null);
  const [selectedStoryForReading, setSelectedStoryForReading] = useState<CommunityStory | null>(null);
  const [isSubmitStoryOpen, setIsSubmitStoryOpen] = useState(false);
  const [isListBusinessOpen, setIsListBusinessOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileZoneOpen, setIsMobileZoneOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'guidelines' | 'community' | 'privacy' | 'terms' | null>(null);

  // 4. Check URL hash on load for deep linking (e.g. #slug or ?id=)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const found = businesses.find((b) => b.slug === hash || b.id === hash);
        if (found) {
          setSelectedBusinessForDetails(found);
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
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        if (sortBy === 'verified') {
          if (a.isClaimed !== b.isClaimed) return a.isClaimed ? -1 : 1;
          if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
          return b.rating - a.rating;
        }
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [businesses, searchQuery, selectedCategory, selectedZone, verifiedOnly, mpesaOnly, sortBy]);

  // Handlers
  const handleViewDetails = (business: Business) => {
    setSelectedBusinessForDetails(business);
    window.history.replaceState(null, '', `#${business.slug}`);
  };

  const handleCloseDetails = () => {
    setSelectedBusinessForDetails(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleClaimSuccess = (updatedBusiness: Business, _claim: BusinessClaim) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === updatedBusiness.id ? updatedBusiness : b))
    );
    if (selectedBusinessForDetails?.id === updatedBusiness.id) {
      setSelectedBusinessForDetails(updatedBusiness);
    }
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

  const handleStorySubmitted = (newStory: CommunityStory) => {
    saveCommunityStory(newStory);
    setStories((prev) => [newStory, ...prev.filter((s) => s.id !== newStory.id)]);
  };

  const handleLikeStory = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, likes: (s.likes || 0) + 1 } : s))
    );
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
    const el = document.getElementById('community-spotlight-section') || document.getElementById('community-updates-section');
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans antialiased text-stone-900 selection:bg-emerald-700 selection:text-white pb-16 md:pb-0">
      {/* 1. Header Navigation Bar */}
      <Header
        onListBusinessClick={() => setIsListBusinessOpen(true)}
        onAboutClick={() => setIsAboutOpen(true)}
        onNoticeboardClick={scrollToNoticeboard}
        onEmergencyClick={() => setIsEmergencyOpen(true)}
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

        {/* Directory Controls & Filtering Section */}
        <section id="directory-section" className="space-y-4 mb-8">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-black text-[#24140E] tracking-tight">
                  {selectedCategory === 'all'
                    ? 'All Kahawa West Businesses'
                    : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Businesses'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'place' : 'places'}
                </span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
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

        {/* Community Spotlight & Housing Updates Section */}
        <section className="mb-12">
          <CommunitySpotlight
            stories={stories}
            updates={updates}
            onReadStory={(story) => setSelectedStoryForReading(story)}
            onSubmitStoryClick={() => setIsSubmitStoryOpen(true)}
          />
        </section>
      </main>

      {/* 3. Footer */}
      <Footer
        onLegalClick={(tab) => setLegalTab(tab)}
        onAboutClick={() => setIsAboutOpen(true)}
        onListBusinessClick={() => setIsListBusinessOpen(true)}
      />

      {/* 4. Mobile Fixed Bottom Navigation for Smartphones */}
      <MobileBottomNav
        onSearchClick={scrollToSearch}
        onZonesClick={() => setIsMobileZoneOpen(true)}
        onListBusinessClick={() => setIsListBusinessOpen(true)}
        onNoticeboardClick={scrollToNoticeboard}
        onEmergencyClick={() => setIsEmergencyOpen(true)}
      />

      {/* 5. Mobile Zone Selector Drawer */}
      <MobileZoneDrawer
        isOpen={isMobileZoneOpen}
        onClose={() => setIsMobileZoneOpen(false)}
        selectedZone={selectedZone}
        onSelectZone={(z) => setSelectedZone(z)}
        zoneCounts={zoneCounts}
      />

      {/* 6. Modals & Dialogs */}

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

      {/* Business Full Detail Modal (5 Photos, Hours, Contacts, M-Pesa, Feedback) */}
      <BusinessDetailModal
        business={selectedBusinessForDetails}
        isOpen={Boolean(selectedBusinessForDetails)}
        onClose={handleCloseDetails}
        onClaimClick={(biz) => {
          setBusinessToClaim(biz);
        }}
        onLeaveFeedbackClick={(biz) => {
          setBusinessForFeedback(biz);
        }}
      />

      {/* Claim & Customize Business Modal (Supabase 'claims' table & 5 photos) */}
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
    </div>
  );
}
