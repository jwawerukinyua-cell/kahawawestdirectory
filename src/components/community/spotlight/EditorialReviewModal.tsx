import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Database,
  ExternalLink,
  Copy,
  Check,
  Star,
  FileText,
  Clock,
  ArrowRight,
  Filter,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { CommunityStory } from '../../../types';
import { Button } from '../../ui/Button';
import { StoryMarkdownRenderer } from './StoryMarkdownRenderer';

interface EditorialReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: CommunityStory[];
  onApproveStory: (storyId: string, featured?: boolean) => void;
  onRejectStory: (storyId: string, reason: string) => void;
  onDeleteStory: (storyId: string) => void;
  onUpdateStoryContent?: (updatedStory: CommunityStory) => void;
  onOpenSubmitModal: () => void;
}

export const EditorialReviewModal: React.FC<EditorialReviewModalProps> = ({
  isOpen,
  onClose,
  stories,
  onApproveStory,
  onRejectStory,
  onDeleteStory,
  onUpdateStoryContent,
  onOpenSubmitModal,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'supabase_guide'>('pending');
  const [previewStory, setPreviewStory] = useState<CommunityStory | null>(null);
  const [editingStory, setEditingStory] = useState<CommunityStory | null>(null);
  const [rejectingStoryId, setRejectingStoryId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const pendingStories = stories.filter((s) => s.status === 'pending_review');
  const publishedStories = stories.filter((s) => s.status === 'published' || !s.status);

  const handleCopySql = () => {
    const sqlCode = `-- Kahawa West Directory: Community Stories Table Schema
CREATE TABLE IF NOT EXISTS public.community_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL,
    zone TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    image_caption TEXT,
    is_real_photo_confirmed BOOLEAN DEFAULT TRUE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_phone TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    read_time_minutes INTEGER DEFAULT 3,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'published', 'archived', 'rejected')),
    rejection_reason TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can read published community stories
CREATE POLICY "Public read published stories"
    ON public.community_stories
    FOR SELECT
    USING (status = 'published');

-- 2. Residents can submit stories (inserted as pending_review)
CREATE POLICY "Anyone can submit stories for review"
    ON public.community_stories
    FOR INSERT
    WITH CHECK (status = 'pending_review');

-- 3. Reviewers / Admins can read and update all stories
CREATE POLICY "Admins can update and approve stories"
    ON public.community_stories
    FOR ALL
    USING (auth.role() = 'authenticated' OR auth.jwt() ->> 'role' = 'admin');
`;
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;
    if (onUpdateStoryContent) {
      onUpdateStoryContent(editingStory);
    }
    setEditingStory(null);
  };

  return (
    <div
      id="editorial-review-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans animate-in fade-in duration-200"
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-300 overflow-hidden my-auto max-h-[92vh] flex flex-col text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-[#1D0C06] text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-[#3D1A0E] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-900/90 text-emerald-300 border border-emerald-600/40">
                  Editorial Desk
                </span>
                <span className="text-xs text-stone-400 hidden sm:inline">
                  Story Previews & Review Workflow
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                Community Spotlight Review & Approvals
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-stone-200 px-5 sm:px-7 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('pending');
                setPreviewStory(null);
                setEditingStory(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'pending'
                    ? 'bg-white text-emerald-900'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {pendingStories.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('published');
                setPreviewStory(null);
                setEditingStory(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'published'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live on Spotlight</span>
              <span className="text-[11px] opacity-75">({publishedStories.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('supabase_guide');
                setPreviewStory(null);
                setEditingStory(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'supabase_guide'
                  ? 'bg-[#3ECF8E] text-stone-950 font-black shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Supabase Workflow & SQL</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onClose();
              onOpenSubmitModal();
            }}
            className="text-xs font-bold border-emerald-600 text-emerald-800 hover:bg-emerald-50"
            icon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Submit Test Story
          </Button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* 1. Supabase & Workflow Guide Tab */}
          {activeTab === 'supabase_guide' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-[#1D0C06] text-white border border-[#3D1A0E] space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Database className="w-5 h-5 text-[#3ECF8E]" />
                  <span>How the Story Review & Supabase Pipeline Works</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  You have <strong>two flexible ways</strong> to preview and approve stories before they appear live on the Kahawa West Community Spotlight:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> 1. In-App Editorial Desk (Fastest)
                    </span>
                    <p className="text-stone-300 text-[11px] leading-relaxed">
                      Preview submitted stories right here with live Markdown rendering, verify author identity and contact numbers, and click <strong>"Approve & Publish Live"</strong>. It instantly pushes the story to the spotlight without writing code.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-[#3ECF8E]" /> 2. Supabase Table Editor
                    </span>
                    <p className="text-stone-300 text-[11px] leading-relaxed">
                      In your Supabase project, all resident submissions land in the <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">community_stories</code> table with <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">status = 'pending_review'</code>. When you change it to <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">'published'</code>, it goes live immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Copyable SQL Schema */}
              <div className="p-5 rounded-2xl bg-white border border-stone-300 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-stone-900 text-sm sm:text-base">
                      Supabase SQL Table Schema & Policies
                    </h3>
                    <p className="text-xs text-stone-500">
                      Copy and run this in your Supabase SQL Editor to initialize the Community Stories table.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopySql}
                    className="text-xs font-bold text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                    icon={copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copiedSql ? 'SQL Copied!' : 'Copy SQL Schema'}
                  </Button>
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-xl bg-stone-900 text-stone-200 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed border border-stone-800">
{`-- 1. Create table for Community Stories
CREATE TABLE public.community_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL,
    zone TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    image_caption TEXT,
    is_real_photo_confirmed BOOLEAN DEFAULT TRUE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_phone TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    read_time_minutes INTEGER DEFAULT 3,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'published', 'archived', 'rejected')),
    rejection_reason TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Row Level Security Policies
ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published stories" 
ON public.community_stories FOR SELECT USING (status = 'published');

CREATE POLICY "Public can submit stories as pending_review" 
ON public.community_stories FOR INSERT WITH CHECK (status = 'pending_review');`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* 2. Full Live Story Preview Modal within Reviewer */}
          {previewStory && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-emerald-600 shadow-xl space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Live Story Preview Mode
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    Status: <strong className="uppercase text-stone-800">{previewStory.status || 'pending_review'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewStory(null)}
                  >
                    Close Preview
                  </Button>

                  {previewStory.status !== 'published' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        onApproveStory(previewStory.id, previewStory.featured);
                        setPreviewStory(null);
                      }}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve & Publish Live
                    </Button>
                  )}
                </div>
              </div>

              {/* Author Identity Banner */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                    Submitted Author & Verification Contacts
                  </span>
                  <h4 className="font-display font-bold text-stone-900 text-sm">
                    {previewStory.authorName} ({previewStory.authorRole || 'Resident'})
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-stone-600 mt-1">
                    <span>📍 {previewStory.zone}</span>
                    <span>•</span>
                    <a href={`tel:${previewStory.authorPhone}`} className="text-emerald-700 font-bold hover:underline">
                      📞 {previewStory.authorPhone}
                    </a>
                    <span>•</span>
                    <a href={`mailto:${previewStory.authorEmail}`} className="text-emerald-700 font-bold hover:underline">
                      ✉️ {previewStory.authorEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${(previewStory.authorPhone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold hover:bg-emerald-100 transition flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>WhatsApp Author</span>
                  </a>
                </div>
              </div>

              {/* Formatted Article Preview */}
              <div className="space-y-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-900 text-emerald-200">
                    {previewStory.category}
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1D0C06] mt-2 mb-1">
                    {previewStory.title}
                  </h1>
                  {previewStory.subtitle && (
                    <p className="text-stone-600 text-sm font-medium">{previewStory.subtitle}</p>
                  )}
                </div>

                {previewStory.imageUrl && (
                  <div className="rounded-2xl overflow-hidden max-h-[360px] bg-stone-900 shadow-md">
                    <img
                      src={previewStory.imageUrl}
                      alt={previewStory.title}
                      className="w-full h-full object-cover max-h-[360px]"
                    />
                    {previewStory.imageCaption && (
                      <p className="text-[11px] text-stone-400 bg-stone-900 px-3 py-1.5 italic">
                        {previewStory.imageCaption}
                      </p>
                    )}
                  </div>
                )}

                <div className="py-2 border-t border-stone-200">
                  <StoryMarkdownRenderer content={previewStory.content} />
                </div>
              </div>
            </div>
          )}

          {/* 3. Inline Quick Edit Form */}
          {editingStory && (
            <form
              onSubmit={handleSaveEdit}
              className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-amber-500 shadow-xl space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  <h3 className="font-display font-bold text-stone-900 text-base">
                    Quick Edit & Polish Story
                  </h3>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditingStory(null)}>
                  Cancel Edit
                </Button>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Headline / Title
                </label>
                <input
                  type="text"
                  required
                  value={editingStory.title}
                  onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm bg-[#FAF8F5] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editingStory.subtitle || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Markdown Content
                </label>
                <textarea
                  rows={8}
                  required
                  value={editingStory.content}
                  onChange={(e) => setEditingStory({ ...editingStory, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-[#FAF8F5] font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingStory(null)}>
                  Discard Changes
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-bold">
                  Save Story Changes
                </Button>
              </div>
            </form>
          )}

          {/* 4. Pending Review Tab */}
          {activeTab === 'pending' && !previewStory && !editingStory && (
            <div className="space-y-4">
              {pendingStories.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-stone-900">
                    All Stories Reviewed!
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    There are currently no community submissions waiting for review. You can test the submission form or explore published stories.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      onClose();
                      onOpenSubmitModal();
                    }}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
                    icon={<Sparkles className="w-4 h-4" />}
                  >
                    Submit a Test Story
                  </Button>
                </div>
              ) : (
                pendingStories.map((story) => (
                  <div
                    key={story.id}
                    className="p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-sm hover:shadow-md transition space-y-4"
                  >
                    {/* Story Header & Badges */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" /> Awaiting Review
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-stone-100 text-stone-800">
                            {story.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-stone-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-700" /> {story.zone}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-stone-900 text-lg leading-snug">
                          {story.title}
                        </h3>
                        {story.subtitle && (
                          <p className="text-xs text-stone-600 mt-0.5 font-medium">{story.subtitle}</p>
                        )}
                      </div>

                      {story.imageUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                          <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Author Verification Box */}
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">✍️ {story.authorName}</span>
                          <span className="text-stone-500 font-medium">({story.authorRole || 'Resident'})</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-stone-600 text-[11px]">
                          <a href={`tel:${story.authorPhone}`} className="hover:text-emerald-700 font-medium">
                            📞 {story.authorPhone}
                          </a>
                          <span>•</span>
                          <a href={`mailto:${story.authorEmail}`} className="hover:text-emerald-700 font-medium">
                            ✉️ {story.authorEmail}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${(story.authorPhone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold hover:bg-emerald-100 text-[11px] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-emerald-700" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Story Excerpt */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                      {story.excerpt || story.content.slice(0, 180)}...
                    </p>

                    {/* Review & Moderation Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewStory(story)}
                          className="text-xs font-bold text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                          icon={<Eye className="w-3.5 h-3.5 text-emerald-700" />}
                        >
                          Preview Full Story
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingStory(story)}
                          className="text-xs font-medium text-stone-700 hover:bg-stone-100"
                          icon={<Edit3 className="w-3.5 h-3.5 text-stone-500" />}
                        >
                          Edit Content
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Are you sure you want to reject/delete "${story.title}"?`)) {
                              onDeleteStory(story.id);
                            }
                          }}
                          className="text-xs font-medium text-rose-700 border-rose-200 hover:bg-rose-50"
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                        >
                          Reject
                        </Button>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onApproveStory(story.id, true)}
                          className="text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white"
                          icon={<Star className="w-3.5 h-3.5 text-amber-300" />}
                        >
                          Approve as Featured
                        </Button>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onApproveStory(story.id, false)}
                          className="text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Approve & Publish Live
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. Published Stories Tab */}
          {activeTab === 'published' && !previewStory && !editingStory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>{publishedStories.length} stories currently live on Kahawa West Community Spotlight</span>
              </div>

              {publishedStories.map((story) => (
                <div
                  key={story.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500/50 shadow-2xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    {story.imageUrl && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                        <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Live
                        </span>
                        {story.featured && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Featured
                          </span>
                        )}
                        <span className="text-[11px] text-stone-500 font-medium">
                          {story.category} • {story.zone}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-stone-900 text-sm leading-snug">
                        {story.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        By {story.authorName} ({story.authorRole || 'Resident'}) • 👏 {story.likes || 0} applauds
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewStory(story)}
                      className="text-xs font-semibold text-emerald-800"
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingStory(story)}
                      className="text-xs font-semibold text-stone-700"
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Remove "${story.title}" from live directory?`)) {
                          onDeleteStory(story.id);
                        }
                      }}
                      className="text-xs text-rose-700 hover:bg-rose-50"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>KWEST Community Spotlight Editorial System Active</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Desk
          </Button>
        </div>
      </div>
    </div>
  );
};
