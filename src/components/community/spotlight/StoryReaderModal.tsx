import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Share2,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Camera,
  Clock,
  MessageCircle,
  Check,
  Send,
  User,
  MessageSquare,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CommunityStory, StoryComment, EstateZone, StoryCategory } from '../../../types';
import { Button } from '../../ui/Button';
import { StoryMarkdownRenderer } from './StoryMarkdownRenderer';
import { ListingImage } from '../../ui/ListingImage';
import { copyToClipboard } from '../../../lib/clipboard';
import {
  getStoryComments,
  addStoryComment,
  deleteStoryComment,
  getStoryReactions,
  toggleStoryReaction,
  StoryReactionState,
} from '../../../lib/storyInteractions';
import { compressImageFile, validateImageFile } from '../../../lib/imageCompression';

interface StoryReaderModalProps {
  story: CommunityStory | null;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (storyId: string) => void;
  onDislike?: (storyId: string) => void;
  onUpdateStory?: (updatedStory: CommunityStory) => void;
}

const SPOTLIGHT_ZONES: EstateZone[] = [
  'Congo',
  'Roundabout',
  'Jacaranda Estate',
  'Jubilee Estate',
  'Northern Bypass',
  'Kware / Quarry',
  'Bima Road',
  'Soweto',
  'Kamae',
  'Station / Railway',
  'Mahiga',
  'Kamiti Road',
  'Kiamumbi Border',
];

const STORY_CATEGORIES: StoryCategory[] = [
  'Crime & Safety',
  'Community Initiative',
  'Local Business & Artisan',
  'Youth & Sports',
  'Schools & Education',
  'Socio-Economic Development',
  'Environment & Clean-up',
  'Neighborhood Events',
  'Public Safety & Security',
];

export const StoryReaderModal: React.FC<StoryReaderModalProps> = ({
  story,
  isOpen,
  onClose,
  onLike,
  onDislike,
  onUpdateStory,
}) => {
  const [activeStory, setActiveStory] = useState<CommunityStory | null>(story);
  const [copied, setCopied] = useState(false);
  const [reactionState, setReactionState] = useState<StoryReactionState>({
    userReaction: null,
    likes: 0,
    dislikes: 0,
  });

  // Comments state
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [authorNameInput, setAuthorNameInput] = useState('');
  const [commentTextInput, setCommentTextInput] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null);

  // Edit Story state (works on pending, approved, and live stories)
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState<StoryCategory>('Crime & Safety');
  const [editZone, setEditZone] = useState<EstateZone>('Roundabout');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageCaption, setEditImageCaption] = useState('');
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editAuthorRole, setEditAuthorRole] = useState('');
  const [editAuthorPhone, setEditAuthorPhone] = useState('');
  const [editAuthorEmail, setEditAuthorEmail] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Sync state whenever story changes or opens
  useEffect(() => {
    if (story) {
      setActiveStory(story);
      const reactions = getStoryReactions(story.id, story.likes || 0, story.dislikes || 0);
      setReactionState(reactions);
      const loadedComments = getStoryComments(story.id);
      setComments(loadedComments);
      setCommentTextInput('');
      setCommentFeedback(null);

      // Populate edit fields
      setEditTitle(story.title || '');
      setEditSubtitle(story.subtitle || '');
      setEditCategory(story.category || 'Crime & Safety');
      setEditZone(story.zone || 'Roundabout');
      setEditContent(story.content || '');
      setEditImageUrl(story.imageUrl || '');
      setEditImageCaption(story.imageCaption || '');
      setEditAuthorName(story.authorName || '');
      setEditAuthorRole(story.authorRole || '');
      setEditAuthorPhone(story.authorPhone || '');
      setEditAuthorEmail(story.authorEmail || '');
      setIsEditing(false);
    }
  }, [story, isOpen]);

  if (!isOpen || !story) return null;
  const currentStory = activeStory || story;

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error || 'Invalid photo format');
        return;
      }
      try {
        setIsUploadingPhoto(true);
        const dataUrl = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.78 });
        setEditImageUrl(dataUrl);
      } catch (err) {
        console.error('Failed to compress story photo:', err);
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const getStoryUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const storyKey = currentStory.slug || currentStory.id;
    return `${origin}/?view=stories&story=${encodeURIComponent(storyKey)}`;
  };

  const handleShare = () => {
    const shareUrl = getStoryUrl();
    const shareTitle = `${currentStory.title} - Read this inspiring Kahawa West community story on KWEST Directory`;

    if (navigator.share) {
      navigator
        .share({
          title: currentStory.title,
          text: shareTitle,
          url: shareUrl,
        })
        .catch(() => {
          copyLink();
        });
    } else {
      copyLink();
    }
  };

  const copyLink = async () => {
    const shareUrl = getStoryUrl();
    const shareText = `${currentStory.title} - Read this inspiring Kahawa West community story on KWEST Directory\n${shareUrl}`;
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const shareUrl = getStoryUrl();
    const message = `*${currentStory.title}*\n\nRead this inspiring Kahawa West community story on KWEST Directory:\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Like reaction toggle
  const handleLikeClick = () => {
    const updated = toggleStoryReaction(currentStory.id, 'like', currentStory.likes || 0, currentStory.dislikes || 0);
    setReactionState(updated);
    if (updated.userReaction === 'like' && onLike) {
      onLike(currentStory.id);
    }
  };

  // Dislike reaction toggle
  const handleDislikeClick = () => {
    const updated = toggleStoryReaction(currentStory.id, 'dislike', currentStory.likes || 0, currentStory.dislikes || 0);
    setReactionState(updated);
    if (updated.userReaction === 'dislike' && onDislike) {
      onDislike(currentStory.id);
    }
  };

  // Post comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentTextInput.trim();
    if (!text) return;

    setIsPostingComment(true);
    const newComment = addStoryComment(
      currentStory.id,
      authorNameInput.trim() || 'Kahawa West Reader',
      text,
      'Resident / Reader'
    );

    setComments((prev) => [newComment, ...prev]);
    setCommentTextInput('');
    setCommentFeedback('Your comment has been added!');
    setIsPostingComment(false);

    setTimeout(() => {
      setCommentFeedback(null);
    }, 3000);
  };

  const handleDeleteComment = (commentId: string) => {
    const updated = deleteStoryComment(currentStory.id, commentId);
    setComments(updated);
  };

  const handleSaveStoryChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) return;

    const updatedStory: CommunityStory = {
      ...currentStory,
      title: editTitle.trim(),
      subtitle: editSubtitle.trim() || undefined,
      category: editCategory,
      zone: editZone,
      content: editContent.trim(),
      excerpt: editContent.trim().slice(0, 160).replace(/[#*`_]/g, '') + '...',
      imageUrl: editImageUrl.trim() || undefined,
      imageCaption: editImageCaption.trim() || undefined,
      authorName: editAuthorName.trim() || currentStory.authorName,
      authorRole: editAuthorRole.trim() || currentStory.authorRole,
      authorPhone: editAuthorPhone.trim() || currentStory.authorPhone,
      authorEmail: editAuthorEmail.trim() || currentStory.authorEmail,
    };

    setActiveStory(updatedStory);
    if (onUpdateStory) {
      onUpdateStory(updatedStory);
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div
      id="story-reader-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto overflow-x-hidden font-sans animate-in fade-in duration-200"
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-300 overflow-hidden my-auto max-h-[92vh] flex flex-col text-stone-900 min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#4D0202] text-white px-4 sm:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#630303] flex-shrink-0 min-w-0">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 truncate">
              {isEditing ? 'Editing Story' : currentStory.category}
            </span>
            {currentStory.status === 'pending_review' ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50 truncate">
                Pending Review
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 truncate">
                Live &amp; Published
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onUpdateStory && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-600 text-xs font-semibold transition active:scale-95 shadow-xs"
                title="Edit this story"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Story</span>
              </button>
            )}

            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition active:scale-95"
              >
                Cancel
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-[#630303] text-stone-200 hover:text-white transition active:scale-95 flex-shrink-0"
              aria-label="Close Story"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Notification on Save */}
        {saveSuccess && (
          <div className="bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-inner">
            <Check className="w-4 h-4" />
            <span>Story updated successfully! Live changes saved.</span>
          </div>
        )}

        {isEditing ? (
          /* Live Story Editor Form */
          <form onSubmit={handleSaveStoryChanges} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-7 space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Editing live published story. Changes will immediately reflect across the Kahawa West website.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Story Title *
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base sm:text-sm bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                One-Line Subtitle / Summary (Optional)
              </label>
              <input
                type="text"
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base sm:text-sm bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as StoryCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base sm:text-sm bg-white"
                >
                  {STORY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Estate Zone in Kahawa West *
                </label>
                <select
                  value={editZone}
                  onChange={(e) => setEditZone(e.target.value as EstateZone)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base sm:text-sm bg-white"
                >
                  {SPOTLIGHT_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Featured Photo (URL or File Upload)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="/kwest-logo.png or upload"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base sm:text-sm bg-white"
                  />
                  <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0 transition text-stone-700">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Photo Caption
                </label>
                <input
                  type="text"
                  value={editImageCaption}
                  onChange={(e) => setEditImageCaption(e.target.value)}
                  placeholder="e.g. Kahawa West Grounds"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base sm:text-sm bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  required
                  value={editAuthorName}
                  onChange={(e) => setEditAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base sm:text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Author Role *
                </label>
                <input
                  type="text"
                  required
                  value={editAuthorRole}
                  onChange={(e) => setEditAuthorRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base sm:text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Article Content (Markdown Supported) *
              </label>
              <textarea
                required
                rows={12}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base sm:text-sm bg-white leading-relaxed font-sans min-h-[240px] resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Story Changes</span>
              </Button>
            </div>
          </form>
        ) : (
          /* Scrollable Story Body */
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 space-y-6 min-w-0">
          {/* Title & Subtitle */}
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-3xl md:text-4xl font-extrabold text-[#630303] tracking-tight leading-tight mb-2 break-words">
              {currentStory.title}
            </h1>
            {currentStory.subtitle && (
              <p className="text-sm sm:text-lg text-stone-600 font-medium leading-snug break-words">
                {currentStory.subtitle}
              </p>
            )}
          </div>

          {/* Meta Information Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-stone-200 text-xs text-stone-600">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{currentStory.zone}</span>
              </div>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>{currentStory.date}</span>
              </div>
              {currentStory.readTimeMinutes && (
                <>
                  <span className="text-stone-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span>{currentStory.readTimeMinutes} min read</span>
                  </div>
                </>
              )}
            </div>

            {currentStory.isRealPhotoConfirmed && (
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Real Photo (No AI)</span>
              </div>
            )}
          </div>

          {/* Featured Image */}
          {currentStory.imageUrl && currentStory.imageUrl.trim() !== '' && (
            <div className="space-y-1.5">
              <div className={`relative rounded-2xl overflow-hidden shadow-md max-h-[420px] flex items-center justify-center ${currentStory.imageUrl.includes('logo') ? 'bg-stone-950 p-6' : 'bg-stone-900'}`}>
                <ListingImage
                  src={currentStory.imageUrl}
                  story={currentStory}
                  customCaption={currentStory.imageCaption}
                  imageType="cover"
                  className={currentStory.imageUrl.includes('logo') ? 'max-h-[360px] max-w-full object-contain mx-auto' : 'w-full h-full object-cover max-h-[420px]'}
                />
              </div>
              {currentStory.imageCaption && (
                <p className="text-xs text-stone-500 italic pl-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-stone-400" />
                  <span>{currentStory.imageCaption}</span>
                </p>
              )}
            </div>
          )}

          {/* Story Narrative Content */}
          <div className="py-2">
            <StoryMarkdownRenderer content={currentStory.content} />
          </div>

          {/* Author Badge & Reader Interactions Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-base flex items-center justify-center flex-shrink-0 border border-emerald-300">
                  {(currentStory.authorName || 'K').charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mb-1">
                    Verified Resident Contributor
                  </span>
                  <h4 className="font-display font-bold text-stone-900 text-sm sm:text-base leading-tight">
                    {currentStory.authorName}
                  </h4>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">
                    {currentStory.authorRole || 'Kahawa West Resident'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-stone-500">
                    <span>📍 {currentStory.zone}</span>
                    <span>•</span>
                    <span>🗓️ {currentStory.date}</span>
                  </div>
                </div>
              </div>

              {/* Share & External Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition active:scale-95 cursor-pointer shadow-xs"
                  title="Share this story directly on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700 fill-emerald-600/20" />
                  <span>WhatsApp</span>
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-sky-600" />}
                >
                  <span>{copied ? 'Link Copied!' : 'Share / Copy'}</span>
                </Button>
              </div>
            </div>

            {/* Reader Reactions (Like & Dislike Controls) */}
            <div className="pt-3 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <span>Reader Feedback:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 min-w-0">
                {/* Applaud / Like Button */}
                <button
                  type="button"
                  onClick={handleLikeClick}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 cursor-pointer ${
                    reactionState.userReaction === 'like'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-xs'
                      : 'bg-stone-50 text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/60 border-stone-200'
                  }`}
                  title="Applaud / Like this story"
                >
                  <ThumbsUp
                    className={`w-3.5 h-3.5 ${
                      reactionState.userReaction === 'like' ? 'fill-emerald-700 text-emerald-700' : 'text-stone-500'
                    }`}
                  />
                  <span>Applaud</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/80 border border-stone-200/80 text-[11px] font-bold">
                    {reactionState.likes}
                  </span>
                </button>

                {/* Dislike Button */}
                <button
                  type="button"
                  onClick={handleDislikeClick}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 cursor-pointer ${
                    reactionState.userReaction === 'dislike'
                      ? 'bg-rose-100 text-rose-900 border-rose-400 shadow-xs'
                      : 'bg-stone-50 text-stone-600 hover:text-rose-800 hover:bg-rose-50/60 border-stone-200'
                  }`}
                  title="Dislike this story or report concern"
                >
                  <ThumbsDown
                    className={`w-3.5 h-3.5 ${
                      reactionState.userReaction === 'dislike' ? 'fill-rose-700 text-rose-700' : 'text-stone-400'
                    }`}
                  />
                  <span>Dislike</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/80 border border-stone-200/80 text-[11px] font-bold">
                    {reactionState.dislikes}
                  </span>
                </button>

                {/* Jump to Comments counter */}
                <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium ml-1">
                  <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                  <span>{comments.length} comment{comments.length === 1 ? '' : 's'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4. Small Space for Comments */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4 min-w-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 text-[#630303] flex-shrink-0" />
                <h3 className="font-display font-bold text-stone-900 text-sm sm:text-base truncate">
                  Community Comments & Discussion
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200 flex-shrink-0">
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="space-y-3 bg-stone-50 p-3.5 sm:p-4 rounded-xl border border-stone-200 min-w-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={authorNameInput}
                    onChange={(e) => setAuthorNameInput(e.target.value)}
                    placeholder="Your name or estate nickname (optional)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <textarea
                  value={commentTextInput}
                  onChange={(e) => setCommentTextInput(e.target.value)}
                  placeholder="Share a respectful thought, celebration, or question about this story..."
                  rows={2}
                  className="w-full p-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  required
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-500">
                    Keep community comments non-political and respectful.
                  </span>

                  <button
                    type="submit"
                    disabled={!commentTextInput.trim() || isPostingComment}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0D6E44] hover:bg-[#0B5C39] disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-xs self-end sm:self-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </div>

              {commentFeedback && (
                <div className="text-xs text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-3 py-1.5 rounded-lg font-medium animate-in fade-in">
                  {commentFeedback}
                </div>
              )}
            </form>

            {/* List of Comments */}
            <div className="space-y-3 pt-1 min-w-0">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-stone-500 text-xs">
                  <p>No comments yet. Leave the first thought or reaction above!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200 text-xs space-y-1.5 min-w-0 overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-[#4D0202] text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-stone-900 truncate">{comment.authorName}</span>
                        {comment.authorRole && (
                          <span className="text-[10px] text-stone-500 bg-white px-1.5 py-0.2 rounded-md border border-stone-200 truncate hidden xs:inline">
                            {comment.authorRole}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-stone-400">{comment.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition"
                          title="Remove comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-stone-700 text-xs leading-relaxed pl-8 break-words">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        )}

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs text-stone-600 flex-shrink-0 min-w-0">
          <span className="text-[11px] text-center sm:text-left text-stone-500">
            Reviewed & approved by KWEST Community Editorial
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Close Article
          </Button>
        </div>
      </div>
    </div>
  );
};
