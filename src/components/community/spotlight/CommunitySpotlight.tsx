import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  MapPin,
  ShieldCheck,
  Camera,
  ArrowRight,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { CommunityStory } from '../../../types';

interface CommunitySpotlightProps {
  stories: CommunityStory[];
  onReadStory: (story: CommunityStory) => void;
  onSubmitStoryClick: () => void;
  onOpenEditorialDesk?: () => void;
  pendingCount?: number;
}

export const CommunitySpotlight: React.FC<CommunitySpotlightProps> = ({
  stories,
  onReadStory,
  onSubmitStoryClick,
  onOpenEditorialDesk,
  pendingCount = 0,
}) => {
  const [selectedStoryCategory, setSelectedStoryCategory] = useState<string>('all');
  const [featuredImgError, setFeaturedImgError] = useState(false);

  // Find the featured story (or the first available story)
  const featuredStory = stories.find((s) => s.featured && s.status === 'published') || stories[0];

  const categories: string[] = [
    'all',
    'Environment & Clean-up',
    'Youth & Sports',
    'Local Business & Artisan',
    'Schools & Education',
    'Socio-Economic Development',
  ];

  const filteredStories = stories.filter((s) => {
    if (selectedStoryCategory === 'all') return true;
    return s.category === selectedStoryCategory;
  });

  return (
    <div id="community-spotlight-section" className="font-sans mb-12">
      {/* 1. Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 px-4">
        {/* Top Green Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0D6E44]/15 text-emerald-700 border border-emerald-500/30 mb-4 shadow-xs backdrop-blur-md">
          <span className="text-sm">📰</span>
          <span className="tracking-wide uppercase font-bold text-[11px]">COMMUNITY SPOTLIGHT</span>
        </div>

        {/* Main Title with the requested black text styling */}
        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-black mb-3 sm:mb-4 leading-tight">
          The Stories That Bring Kahawa West Together
        </h2>

        {/* Subtitle */}
        <p className="text-stone-600 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto">
          From inspiring residents and local businesses to schools, sports, neighbourhood events and community initiatives, KWEST shines a spotlight on the stories that matter most. Every story is reviewed before publication to help keep our community informed, inspired and connected.
        </p>

        {/* Action / Editorial Desk Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
          <button
            onClick={onSubmitStoryClick}
            className="px-4 py-2 rounded-2xl bg-[#630303] hover:bg-[#4E0202] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>Submit a Story</span>
          </button>

          {onOpenEditorialDesk && (
            <button
              onClick={onOpenEditorialDesk}
              className="px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition flex items-center gap-2 shadow-xs active:scale-95"
              title="Review pending submissions, community updates or claims"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Editorial Desk</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-black animate-pulse">
                  {pendingCount} new
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Featured Showcase Card */}
      <div className="bg-[#121820] text-white rounded-3xl overflow-hidden shadow-2xl border border-stone-800/80 mb-10">
        {/* Top Media / Photo Section */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 bg-[#0E1318] flex items-center justify-center overflow-hidden border-b border-stone-800">
          {featuredStory?.imageUrl && !featuredImgError ? (
            <>
              <img
                src={featuredStory.imageUrl}
                alt={featuredStory.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                referrerPolicy="no-referrer"
                onError={() => setFeaturedImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121820] via-transparent to-black/30" />
              
              {/* Landmark Zone & Real Photo Badge */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#121820]/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {featuredStory.zone}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/70 text-stone-200 border border-stone-600 backdrop-blur-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Real Photograph
                </span>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <div className="text-2xl sm:text-3xl mb-2">📷</div>
              <h4 className="font-display font-bold text-stone-200 text-lg sm:text-xl">
                Community Photo
              </h4>
              <p className="text-stone-400 text-xs sm:text-sm mt-1 font-medium">Coming Soon</p>
            </div>
          )}
        </div>

        {/* Bottom Content Area */}
        <div className="p-6 sm:p-8 md:p-10 bg-[#121820]">
          {/* Featured This Week Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 mb-3">
            <span className="text-amber-400">★</span>
            <span>FEATURED THIS WEEK</span>
          </div>

          {/* Title & Description */}
          <h3 className="font-display text-xl sm:text-3xl font-extrabold text-white mb-3 leading-snug">
            {featuredStory ? featuredStory.title : 'This Space Belongs to the Community'}
          </h3>

          <p className="text-stone-300 text-xs sm:text-base leading-relaxed max-w-3xl mb-6">
            {featuredStory?.subtitle ||
              featuredStory?.excerpt ||
              'Every positive story deserves to be celebrated, from neighbourhood clean-ups to students earning recognition and local businesses making a difference.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {featuredStory && (
              <button
                onClick={() => onReadStory(featuredStory)}
                className="px-5 py-2.5 rounded-xl bg-[#0D6E44] hover:bg-[#0B5C39] text-white text-xs sm:text-sm font-bold transition shadow-lg flex items-center gap-2 active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read This Week's Story</span>
              </button>
            )}

            <button
              onClick={onSubmitStoryClick}
              className="px-5 py-2.5 rounded-xl bg-[#1D2630] hover:bg-[#25313E] text-stone-200 hover:text-white border border-stone-700 text-xs sm:text-sm font-bold transition flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Submit a Story</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Browse Community Stories by Category */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-[#630303] text-lg sm:text-xl">
              More Inspiring Local Stories
            </h3>
            <p className="text-xs text-stone-500">
              Real non-political socio-economic developments submitted by residents
            </p>
          </div>

          <button
            onClick={onSubmitStoryClick}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Share Your Neighborhood Story</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedStoryCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedStoryCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition active:scale-95 ${
                  isSelected
                    ? 'bg-[#630303] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                }`}
              >
                {cat === 'all' ? 'All Stories' : cat}
              </button>
            );
          })}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              onClick={() => onReadStory(story)}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-xl hover:border-emerald-600 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Story Photo */}
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  {story.imageUrl ? (
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                      <Camera className="w-6 h-6 mb-1" />
                      <span>Community Photo</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#630303]/90 text-emerald-200 border border-emerald-500/40 backdrop-blur-md">
                      {story.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {story.zone}
                    </span>
                  </div>
                </div>

                {/* Story Details */}
                <div className="p-5">
                  <h4 className="font-display font-bold text-[#630303] text-base group-hover:text-emerald-800 transition line-clamp-2 mb-2 leading-snug">
                    {story.title}
                  </h4>

                  <p className="text-stone-600 text-xs line-clamp-3 leading-relaxed mb-4">
                    {story.excerpt || story.content}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                    {(story.authorName || 'K').charAt(0)}
                  </div>
                  <span className="truncate max-w-[110px]">{story.authorName || 'Resident'}</span>
                </div>

                <div className="flex items-center gap-3 text-emerald-700 font-bold group-hover:translate-x-0.5 transition">
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
