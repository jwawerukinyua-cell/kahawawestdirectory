import React from 'react';
import { X, Shield, FileText, Lock, Users } from 'lucide-react';

interface LegalModalProps {
  tab: 'guidelines' | 'community' | 'privacy' | 'terms';
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'guidelines' | 'community' | 'privacy' | 'terms') => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  tab,
  isOpen,
  onClose,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="legal-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                kwestdirectory.co.ke
              </span>
              <h3 className="text-lg font-bold text-white">Guidelines & Policies</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 overflow-x-auto scrollbar-none flex-shrink-0">
          <button
            onClick={() => onSelectTab('guidelines')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              tab === 'guidelines' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
            }`}
          >
            Business Listing Guidelines
          </button>
          <button
            onClick={() => onSelectTab('community')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              tab === 'community' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
            }`}
          >
            Community Standards
          </button>
          <button
            onClick={() => onSelectTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              tab === 'privacy' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => onSelectTab('terms')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              tab === 'terms' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
            }`}
          >
            Terms of Use
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-sm text-slate-700 space-y-4 leading-relaxed flex-1">
          {tab === 'guidelines' && (
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Business Listing Guidelines</h4>
              <p>
                To maintain trust and accuracy across Kahawa West, all listings must adhere to these principles:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Physical Presence / Service Area:</strong> The business must operate within Kahawa West or directly provide doorstep services to estate residents.</li>
                <li><strong>Accurate Contact & Pricing:</strong> Phone numbers, WhatsApp lines, and Lipa na M-Pesa Tills/Paybills must be valid and monitored.</li>
                <li><strong>Photo Integrity:</strong> Upload real, unedited photos of your actual premises, menu items, equipment, or products (5 photos recommended).</li>
                <li><strong>Claim Verification:</strong> Business owners must verify their identity and authorization before making edits to prevent fraudulent claims.</li>
              </ul>
            </div>
          )}

          {tab === 'community' && (
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Community Standards & Reviews</h4>
              <p>
                KWEST Directory is built by and for the neighbors of Kahawa West:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Honest Resident Feedback:</strong> Reviews must represent authentic customer experiences. Fake or paid reviews will be removed.</li>
                <li><strong>Civil Discourse:</strong> Abusive language, defamation, or harassment of local merchants or reviewers is strictly prohibited.</li>
                <li><strong>Zero Tolerance for Scams:</strong> Fraudulent house listings, fake deposit requests, or untrusted fundi impersonation will result in permanent blacklisting.</li>
              </ul>
            </div>
          )}

          {tab === 'privacy' && (
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Privacy Policy</h4>
              <p>
                At <strong>kwestdirectory.co.ke</strong>, we respect the privacy of residents and merchants:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>We do not sell personal phone numbers or email addresses to third parties.</li>
                <li>Contact details submitted on public listings are explicitly made available for customer inquiries.</li>
                <li>Claim verification documents or private notes are retained strictly for security auditing and management validation.</li>
              </ul>
            </div>
          )}

          {tab === 'terms' && (
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Terms of Use</h4>
              <p>
                By accessing <strong>kwestdirectory.co.ke</strong>, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Use the information provided for lawful communication and commerce.</li>
                <li>Verify independently before sending advance deposits for house rent or bulky goods purchases.</li>
                <li>Notify the KWEST Directory administration of any inaccurate or outdated information.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
