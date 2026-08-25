import React from 'react';
import { Star, MessageSquarePlus, ShieldCheck, ThumbsUp, Wrench, ThumbsDown } from 'lucide-react';
import { Business } from '../../types';
import { Button } from '../ui/Button';

interface BusinessCommunityFeedbackProps {
  business: Business;
  onLeaveReviewClick: () => void;
}

export const BusinessCommunityFeedback: React.FC<BusinessCommunityFeedbackProps> = ({
  business,
  onLeaveReviewClick,
}) => {
  return (
    <div id="business-feedback-section" className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm mb-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="font-display font-bold text-[#1D0C06] text-lg">Customer Feedback & Reviews</h3>
          <p className="text-xs text-stone-500 mt-0.5">Verified resident ratings & experiences from Kahawa West</p>
        </div>

        <Button
          id="write-review-btn"
          variant="primary"
          size="sm"
          onClick={onLeaveReviewClick}
          className="bg-emerald-700 hover:bg-emerald-600 text-white"
          icon={<MessageSquarePlus className="w-4 h-4" />}
        >
          Rate & Review
        </Button>
      </div>

      {business.reviewCount === 0 ? (
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
          <p className="text-stone-600 text-xs max-w-md mx-auto mb-4">
            Have you transacted or visited <strong>{business.name}</strong>? Be the first Kahawa West neighbor to leave your honest feedback with our simple Better, Good, Improve, or Bad review options.
          </p>
          <button
            onClick={onLeaveReviewClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D0C06] hover:bg-[#34160C] text-white text-xs font-bold transition shadow-sm"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Be the First to Review
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 mb-6">
          <div className="text-center pr-6 border-r border-stone-200">
            <div className="text-3xl font-extrabold text-[#1D0C06] tracking-tight">{business.rating.toFixed(1)}</div>
            <div className="flex items-center justify-center text-amber-400 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(business.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-stone-500 font-medium mt-1 block">
              {business.reviewCount} total reviews
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

