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
} from 'lucide-react';
import { CommunityStory, StoryComment } from '../../../types';
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

interface StoryReaderModalProps {
  story: CommunityStory | null;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (storyId: string) => void;
  onDislike?: (storyId: string) => void;
}

export const StoryReaderModal: React.FC<StoryReaderModalProps> = ({
  story,
  isOpen,
  onClose,
  onLike,
  onDislike,
}) => {
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

  // Sync state whenever story changes or opens
  useEffect(() => {
    if (story) {
      const reactions = getStoryReactions(story.id, story.likes || 0, story.dislikes || 0);
      setReactionState(reactions);
      const loadedComments = getStoryComments(story.id);
      setComments(loadedComments);
      setCommentTextInput('');
      setCommentFeedback(null);
    }
  }, [story?.id, isOpen]);

  if (!isOpen || !story) return null;

  const getStoryUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const storyKey = story.slug || story.id;
    return `${origin}/?view=stories&story=${encodeURIComponent(storyKey)}`;
  };

  const handleShare = () => {
    const shareUrl = getStoryUrl();
    const shareTitle = `${story.title} - Read this inspiring Kahawa West community story on KWEST Directory`;

    if (navigator.share) {
      navigator
        .share({
          title: story.title,
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
    const shareText = `${story.title} - Read this inspiring Kahawa West community story on KWEST Directory\n${shareUrl}`;
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const shareUrl = getStoryUrl();
    const message = `*${story.title}*\n\nRead this inspiring Kahawa West community story on KWEST Directory:\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Like reaction toggle
  const handleLikeClick = () => {
    const updated = toggleStoryReaction(story.id, 'like', story.likes || 0, story.dislikes || 0);
    setReactionState(updated);
    if (updated.userReaction === 'like' && onLike) {
      onLike(story.id);
    }
  };

  // Dislike reaction toggle
  const handleDislikeClick = () => {
    const updated = toggleStoryReaction(story.id, 'dislike', story.likes || 0, story.dislikes || 0);
    setReactionState(updated);
    if (updated.userReaction === 'dislike' && onDislike) {
      onDislike(story.id);
    }
  };

  // Post comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentTextInput.trim();
    if (!text) return;

    setIsPostingComment(true);
    const newComment = addStoryComment(
      story.id,
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
    const updated = deleteStoryComment(story.id, commentId);
    setComments(updated);
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
              {story.category}
            </span>
            {story.status === 'pending_review' && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50 truncate">
                Pending Review
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-[#630303] text-stone-200 hover:text-white transition active:scale-95 flex-shrink-0 ml-2"
            aria-label="Close Story"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Story Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 space-y-6 min-w-0">
          {/* Title & Subtitle */}
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-3xl md:text-4xl font-extrabold text-[#630303] tracking-tight leading-tight mb-2 break-words">
              {story.title}
            </h1>
            {story.subtitle && (
              <p className="text-sm sm:text-lg text-stone-600 font-medium leading-snug break-words">
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
          {story.imageUrl && story.imageUrl.trim() !== '' && (
            <div className="space-y-1.5">
              <div className="relative rounded-2xl overflow-hidden shadow-md bg-stone-900 max-h-[420px]">
                <ListingImage
                  src={story.imageUrl}
                  story={story}
                  customCaption={story.imageCaption}
                  imageType="cover"
                  className="w-full h-full object-cover max-h-[420px]"
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

          {/* Story Narrative Content */}
          <div className="py-2">
            <StoryMarkdownRenderer content={story.content} />
          </div>

          {/* Author Badge & Reader Interactions Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
