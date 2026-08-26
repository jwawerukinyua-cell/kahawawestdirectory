import React from 'react';
import { X, Shield, AlertTriangle, Lock, FileText, CheckCircle2 } from 'lucide-react';

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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#2E0202] text-white p-4 sm:p-6 flex items-center justify-between flex-shrink-0 border-b border-[#4D0202]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-400">
                Official Directory Policies
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white leading-tight">
                Guidelines, Privacy & Terms of Use
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2 overflow-x-auto no-scrollbar flex-shrink-0 gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('terms')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              tab === 'terms' ? 'border-rose-600 text-rose-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Terms & Liability Disclaimer</span>
          </button>
          <button
            onClick={() => onSelectTab('privacy')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              tab === 'privacy' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy & Kenya Data Laws</span>
          </button>
          <button
            onClick={() => onSelectTab('guidelines')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              tab === 'guidelines' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Listing Guidelines</span>
          </button>
          <button
            onClick={() => onSelectTab('community')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              tab === 'community' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Community Standards</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed flex-1">
          {tab === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-amber-900 mb-1">
                      Important Notice: Full Platform Absolution & Disclaimer of Liability
                    </h5>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      KWEST Directory is strictly a community information and local business discovery platform. We are NOT a party to, broker of, or guarantor for any transaction, agreement, service, or payment arranged between users, residents, merchants, fundis, or freelance service providers.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2">1. Absolution from Loss, Scams, or Disputes</h4>
                <p className="mb-2">
                  By using this directory, you explicitly acknowledge and agree that:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li><strong>Zero Liability for Financial Loss:</strong> The platform, administrators, founders, and community coordinators shall have <strong>NO responsibility or liability whatsoever</strong> for any monetary loss, fraudulent scam, default, defective product, poor workmanship, missed appointment, or unmet expectation arising from contacts initiated through this site.</li>
                  <li><strong>Buyer Due Diligence (Caveat Emptor):</strong> Users are solely responsible for conducting their own independent verification before making any financial commitment. <strong>Never send advance deposits, down-payments, or booking fees</strong> for house rentals, fundi tools, or commercial purchases to unverified individuals without physical inspection.</li>
                  <li><strong>Independent Merchant Status:</strong> All listed businesses, shops, artisans, and mobile freelancers operate independently and are not agents, franchisees, or employees of KWEST Directory.</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">2. Reporting Suspicious Activity</h4>
                <p className="text-slate-600 text-xs">
                  While we do not arbitrate commercial disputes, we actively safeguard our community. If you suspect any fraudulent listing, fake till number, impersonation, or scammer, immediately report it to directory administration or the Kahawa West Police Post. Verified fraudulent profiles will be permanently removed.
                </p>
              </div>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-emerald-900 mb-1">
                      Adherence to Kenyan Data Protection Laws
                    </h5>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      KWEST Directory operates in strict compliance with the <strong>Kenya Data Protection Act (No. 24 of 2019)</strong> and the statutory regulations guided by the <strong>Office of the Data Protection Commissioner (ODPC)</strong> of Kenya.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Our Data Protection Principles</h4>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li><strong>Lawful, Fair & Transparent Processing:</strong> We collect and publish business contact details (names, phone numbers, WhatsApp, physical/residential zones) solely based on explicit consent provided by the business owner, merchant, or freelancer during listing or claim submission.</li>
                  <li><strong>Purpose Limitation:</strong> Information submitted for business listings is used exclusively to facilitate customer discovery, neighborhood commerce, and emergency local services across Kahawa West.</li>
                  <li><strong>No Commercial Resale of Personal Data:</strong> We <strong>never sell, lease, or distribute</strong> user phone numbers, emails, or personal data to bulk telemarketers, third-party advertisers, or data brokers.</li>
                  <li><strong>Right to Rectification & Erasure:</strong> In accordance with Section 40 of the Kenya Data Protection Act 2019, any business owner or individual has the right to request modification, correction, or immediate deletion of their personal listing from the directory.</li>
                  <li><strong>Security & Storage:</strong> Data is secured using encrypted cloud storage protocols to protect against unauthorized access, alteration, or unlawful disclosure.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'guidelines' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Business & Freelancer Listing Guidelines</h4>
                <p className="mb-2">
                  To ensure quality and neighbor trust across all Kahawa West zones, all listings must adhere to these criteria:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li><strong>Local Operation & Residential Bases:</strong> The business must either operate a physical shop/office in Kahawa West OR operate from home/provide mobile services directly to Kahawa West residents (freelancers, plumbers, tutors, mobile bakers, etc.).</li>
                  <li><strong>Accurate Contact Information:</strong> Phone lines, WhatsApp contacts, and M-Pesa Till/Paybill numbers must be authentic and actively monitored.</li>
                  <li><strong>Photo Standards:</strong> Upload clear, authentic photos of your actual work, premises, products, or service team (up to 5 photo slots available).</li>
                  <li><strong>Verification Authorization:</strong> Claiming an existing listing requires confirmation of proprietorship or management authority to protect local merchants from unauthorized edits.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'community' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Community Standards & Neighbor Ethics</h4>
                <p className="mb-2">
                  KWEST Directory is an empowering community resource built for the mutual growth of Kahawa West neighbors:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li><strong>Authentic Resident Reviews:</strong> Feedback must reflect genuine resident experiences. Coordinated false reviews or malicious slander will be purged.</li>
                  <li><strong>Respectful Communication:</strong> Defamation, abusive speech, or harassment directed at local merchants or fellow neighbors is prohibited.</li>
                  <li><strong>Zero Tolerance for Fraud:</strong> Any attempt to post phantom apartment vacancies, impersonate certified technicians, or harvest deposits without delivering goods will lead to immediate removal and reporting to local authorities.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Kahawa West Business Directory • Compliant with Kenya Data Protection Act, 2019
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition active:scale-95"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};

