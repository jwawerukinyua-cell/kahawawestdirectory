import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquarePlus,
  ShieldCheck,
  ThumbsUp,
  Wrench,
  ThumbsDown,
  ShoppingBag,
  CornerDownRight,
  Send,
  Lock,
  Building2,
  Calendar,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Business, CommunityFeedback } from '../../types';
import { getStoredFeedback, saveFeedbackBusinessReply } from '../../lib/supabase';
import { verifyMerchantPin } from '../../lib/merchantAuth';
import { Button } from '../ui/Button';

interface BusinessCommunityFeedbackProps {
  business: Business;
  onLeaveReviewClick: () => void;
}

export const BusinessCommunityFeedback: React.FC<BusinessCommunityFeedbackProps> = ({
  business,
  onLeaveReviewClick,
}) => {
  const [feedbackList, setFeedbackList] = useState<CommunityFeedback[]>(() =>
    business?.id ? getStoredFeedback(business.id) : []
  );

  // Response composer state
  const [replyingFeedbackId, setReplyingFeedbackId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Refresh feedback when updated
  useEffect(() => {
    if (!business?.id) return;
    const handleFeedbackUpdate = () => {
      setFeedbackList(getStoredFeedback(business.id));
    };
    window.addEventListener('kwest_feedback_updated', handleFeedbackUpdate);
    return () => window.removeEventListener('kwest_feedback_updated', handleFeedbackUpdate);
  }, [business?.id]);

  if (!business) return null;

  const reviewCount = feedbackList.length > 0 ? feedbackList.length : (business.reviewCount ?? 0);
  const averageRating =
    feedbackList.length > 0
      ? Number(
          (
            feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / feedbackList.length
          ).toFixed(1)
        )
      : (business.rating ?? 0);

  const handleStartReply = (feedbackId: string) => {
    setReplyingFeedbackId(feedbackId);
    setReplyError(null);
    setReplyMessage('');
    setOwnerPin('');
    setOwnerName(business.name ? `${business.name} Owner` : 'Management');
  };

  const handleCancelReply = () => {
    setReplyingFeedbackId(null);
    setReplyError(null);
    setReplyMessage('');
    setOwnerPin('');
  };

  const handleSubmitReply = async (e: React.FormEvent, feedbackId: string) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      setReplyError('Please write your response message.');
      return;
    }
    if (!ownerPin.trim() || ownerPin.length < 4) {
      setReplyError('Please enter your 4-digit business security PIN.');
      return;
    }

    setIsSubmittingReply(true);
    setReplyError(null);

    // Verify PIN against registered merchant auth
    const authResult = verifyMerchantPin(business.id, ownerPin.trim(), business.name);
    if (!authResult.success) {
      setIsSubmittingReply(false);
      setReplyError(authResult.message || 'Incorrect merchant PIN. Please try again.');
      return;
    }

    const replyData = {
      respondedBy: ownerName.trim() || `${business.name} Owner`,
      responseDate: new Date().toISOString().split('T')[0],
      message: replyMessage.trim(),
    };

    await saveFeedbackBusinessReply(feedbackId, replyData);
    setIsSubmittingReply(false);
    setReplyingFeedbackId(null);
    setFeedbackList(getStoredFeedback(business.id));
  };

  const getExperienceBadge = (exp: string) => {
    switch (exp) {
      case 'Better':
      case 'Great':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            Better (5★)
          </span>
        );
      case 'Good':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            Good (4★)
          </span>
        );
      case 'Improve':
      case 'Fair':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            Needs Improvement
          </span>
        );
      case 'Bad':
      case 'Poor':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <ThumbsDown className="w-3 h-3" />
            Disappointed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="business-feedback-section" className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm mb-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
        <div>
          <h3 className="font-display font-bold text-[#1D0C06] text-lg sm:text-xl">
            Customer Feedback & Reviews
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Verified resident ratings, services purchased & merchant responses in Kahawa West
          </p>
        </div>

        <Button
          id="write-review-btn"
          variant="primary"
          size="sm"
          onClick={onLeaveReviewClick}
          className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
          icon={<MessageSquarePlus className="w-4 h-4" />}
        >
          Rate & Review
        </Button>
      </div>

      {/* Aggregate Score Card */}
      {reviewCount > 0 && (
        <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 mb-6">
          <div className="text-center pr-6 border-r border-stone-200">
            <div className="text-3xl font-black text-[#1D0C06] tracking-tight">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center text-amber-400 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-stone-500 font-semibold mt-1 block">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          <div className="text-xs text-stone-600 space-y-1">
            <p className="font-semibold text-stone-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transparent Community Scoreboard</span>
            </p>
            <p className="text-stone-500 max-w-sm">
              Honest resident ratings help neighbors find quality service and guide local businesses on what to upgrade.
            </p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {feedbackList.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl bg-[#FAF8F5] border border-dashed border-stone-300">
          <div className="flex justify-center gap-2 mb-3">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Star className="w-5 h-5 fill-amber-400" />
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ThumbsUp className="w-5 h-5" />
            </span>
            <span className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
              <Wrench className="w-5 h-5" />
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <ThumbsDown className="w-5 h-5" />
            </span>
          </div>
          <h4 className="font-display font-bold text-[#1D0C06] text-base mb-1">
            No customer reviews yet (0.0 ★)
          </h4>
          <p className="text-stone-600 text-xs max-w-md mx-auto mb-4 leading-relaxed">
            Have you transacted or visited <strong>{business.name}</strong>? Be the first neighbor to share what you purchased and your honest customer experience.
          </p>
          <button
            onClick={onLeaveReviewClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D0C06] hover:bg-[#34160C] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Be the First to Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-stone-800 space-y-3 transition hover:border-stone-300"
            >
              {/* Review Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1D0C06] text-white font-bold text-xs flex items-center justify-center">
                    {item.authorName ? item.authorName.charAt(0).toUpperCase() : 'R'}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                      <span>{item.authorName}</span>
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-extrabold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getExperienceBadge(item.experience)}
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Service / Product Transacted Badge */}
              {item.serviceOrProduct && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs font-semibold">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Item / Service: <strong>{item.serviceOrProduct}</strong></span>
                </div>
              )}

              {/* Written Comment */}
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pt-1">
                "{item.comment}"
              </p>

              {/* Official Business Owner Reply if present */}
              {item.businessResponse ? (
                <div className="mt-3 p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Response from {business.name}</span>
                      <span className="text-[10px] text-emerald-700 font-medium">({item.businessResponse.respondedBy})</span>
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {item.businessResponse.responseDate}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 italic pl-5 border-l-2 border-emerald-500">
                    "{item.businessResponse.message}"
                  </p>
                </div>
              ) : replyingFeedbackId === item.id ? (
                /* Inline Business Reply Composer */
                <form
                  onSubmit={(e) => handleSubmitReply(e, item.id)}
                  className="mt-3 p-4 rounded-2xl bg-white border border-stone-300 shadow-md space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                      <CornerDownRight className="w-4 h-4 text-emerald-600" />
                      <span>Official Owner Reply to {item.authorName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Business Verification Required
                    </span>
                  </div>

                  {replyError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {replyError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Your Name / Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Mama Njeri (Proprietor)"
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        4-Digit Merchant PIN *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          maxLength={6}
                          required
                          value={ownerPin}
                          onChange={(e) => setOwnerPin(e.target.value)}
                          placeholder="• • • •"
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono tracking-widest focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Public Reply Message *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Thank the customer, clarify details, or explain how you are addressing their feedback..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      disabled={isSubmittingReply}
                      className="px-3 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReply}
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReply ? 'Verifying PIN...' : 'Post Official Reply'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Button to trigger owner response */
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => handleStartReply(item.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-emerald-700 font-semibold transition cursor-pointer hover:underline"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Respond as Business Owner</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


