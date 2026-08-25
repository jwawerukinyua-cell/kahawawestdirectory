import React, { useState } from 'react';
import { X, Calendar, MapPin, Share2, ThumbsUp, CheckCircle2, ShieldCheck, Camera, Sparkles, Clock, Tag } from 'lucide-react';
import { CommunityStory } from '../../../types';
import { Button } from '../../ui/Button';
import { StoryMarkdownRenderer } from './StoryMarkdownRenderer';

interface StoryReaderModalProps {
  story: CommunityStory | null;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (storyId: string) => void;
}

export const StoryReaderModal: React.FC<StoryReaderModalProps> = ({
  story,
  isOpen,
  onClose,
  onLike,
}) => {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !story) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: story.title,
          text: `${story.title} - Read this inspiring Kahawa West community story on KWEST Directory`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${story.title} - Read more on kwestdirectory.co.ke: ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleLikeClick = () => {
    if (!liked) {
      setLiked(true);
      if (onLike) onLike(story.id);
    }
  };

  return (
    <div
      id="story-reader-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans animate-in fade-in duration-200"
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-300 overflow-hidden my-auto max-h-[92vh] flex flex-col text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#1D0C06] text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-[#3D1A0E] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
              {story.category}
            </span>
            {story.status === 'pending_review' && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50">
                Pending Editorial Review
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#34160C] text-stone-300 hover:text-white transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Story Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Title & Subtitle */}
          <div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1D0C06] tracking-tight leading-tight mb-2">
              {story.title}
            </h1>
            {story.subtitle && (
              <p className="text-base sm:text-lg text-stone-600 font-medium leading-snug">
                {story.subtitle}
              </p>
            )}
          </div>

          {/* Meta Information Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-stone-200 text-xs text-stone-600">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{story.zone}</span>
              </div>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>{story.date}</span>
              </div>
              {story.readTimeMinutes && (
                <>
                  <span className="text-stone-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span>{story.readTimeMinutes} min read</span>
                  </div>
                </>
              )}
            </div>

            {story.isRealPhotoConfirmed && (
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Real Photo (No AI)</span>
              </div>
            )}
          </div>

          {/* Featured Image */}
          {story.imageUrl && (
            <div className="space-y-1.5">
              <div className="relative rounded-2xl overflow-hidden shadow-md bg-stone-900 max-h-[420px]">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover max-h-[420px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              {story.imageCaption && (
                <p className="text-xs text-stone-500 italic pl-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-stone-400" />
                  <span>{story.imageCaption}</span>
                </p>
              )}
            </div>
          )}

          {/* Story Narrative Content with H1, H2, H3, lists, bold & quotes support */}
          <div className="py-2">
            <StoryMarkdownRenderer content={story.content} />
          </div>

          {/* Author Badge & Non-Political Community Stamp */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-base flex items-center justify-center flex-shrink-0 border border-emerald-300">
                {(story.authorName || 'K').charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mb-1">
                  Verified Resident Contributor
                </span>
                <h4 className="font-display font-bold text-stone-900 text-sm sm:text-base leading-tight">
                  {story.authorName}
                </h4>
                <p className="text-xs text-stone-600 font-medium mt-0.5">
                  {story.authorRole || 'Kahawa West Resident'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-stone-500">
                  <span>📍 {story.zone}</span>
                  <span>•</span>
                  <span>🗓️ {story.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLikeClick}
                className={`transition ${
                  liked
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                    : 'text-stone-700 hover:text-emerald-700'
                }`}
                icon={<ThumbsUp className={`w-4 h-4 ${liked ? 'fill-emerald-600 text-emerald-600' : ''}`} />}
              >
                <span>{liked ? 'Applauded!' : 'Applaud Story'}</span>
                <span className="ml-1 text-xs opacity-75">({(story.likes || 0) + (liked ? 1 : 0)})</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                icon={<Share2 className="w-4 h-4 text-sky-600" />}
              >
                <span>{copied ? 'Link Copied!' : 'Share Story'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 flex-shrink-0">
          <span className="text-[11px]">Reviewed & approved by KWEST Community Editorial</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Article
          </Button>
        </div>
      </div>
    </div>
  );
};
