import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import { Business, CommunityFeedback } from '../../../types';
import { saveCommunityFeedback } from '../../../lib/supabase';
import { ExperienceSelector, ExperienceRating } from './ExperienceSelector';
import { Button } from '../../ui/Button';

interface CommunityFeedbackModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSubmitted: (feedback: CommunityFeedback) => void;
}

export const CommunityFeedbackModal: React.FC<CommunityFeedbackModalProps> = ({
  business,
  isOpen,
  onClose,
  onFeedbackSubmitted,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [serviceOrProduct, setServiceOrProduct] = useState('');
  const [experience, setExperience] = useState<ExperienceRating>('Better');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !business) return null;

  const handleExperienceChange = (exp: ExperienceRating) => {
    setExperience(exp);
    if (exp === 'Better') setRating(5);
    else if (exp === 'Good') setRating(4);
    else if (exp === 'Improve') setRating(2);
    else if (exp === 'Bad') setRating(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim() || !serviceOrProduct.trim()) {
      alert('Please enter your name, the service or product transacted, and your review comments.');
      return;
    }

    setIsSubmitting(true);

    const feedbackItem: CommunityFeedback = {
      id: `fb-${Date.now()}`,
      businessId: business.id,
      businessName: business.name,
      authorName: authorName.trim(),
      serviceOrProduct: serviceOrProduct.trim(),
      experience,
      rating,
      tags: ['Verified Resident', experience],
      comment: comment.trim(),
      created_at: new Date().toISOString(),
    };

    await saveCommunityFeedback(feedbackItem);

    setSubmitted(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onFeedbackSubmitted(feedbackItem);
      onClose();
    }, 1500);
  };

  return (
    <div
      id="feedback-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-lg rounded-3xl shadow-2xl border border-[#3D1A0E]/30 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1D0C06] text-white p-5 flex items-center justify-between border-b border-[#3D1A0E]">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Community Review
            </span>
            <h3 className="text-lg font-bold font-display text-white">Rate {business.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#34160C] text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold font-display text-[#1D0C06] mb-1">Asante Sana!</h4>
            <p className="text-stone-600 text-sm">
              Your feedback for <strong>{business.name}</strong> has been recorded and will update their rating for fellow Kahawa West neighbors.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <ExperienceSelector selected={experience} onChange={handleExperienceChange} />

            {/* Star selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Stars ({rating}/5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none transition active:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 transition ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'text-stone-300 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Your Review / Advice for Neighbors *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Share your experience with ${business.name}. How was their speed, customer care, pricing, or quality?`}
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Your Name / Resident Tag *
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g., Wangari (Jacaranda) or Baba Stacy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Service or Product Bought *
                </label>
                <input
                  type="text"
                  required
                  value={serviceOrProduct}
                  onChange={(e) => setServiceOrProduct(e.target.value)}
                  placeholder="e.g., Mbuzi Choma 1kg, 5-Seater Sofa, Haircut"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting} className="bg-emerald-700 hover:bg-emerald-600 text-white">
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
