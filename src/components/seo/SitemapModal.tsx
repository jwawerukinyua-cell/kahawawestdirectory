import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Bot,
  Search,
  Layers,
  Sparkles,
  MapPin,
  Building2,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  X,
  RefreshCw,
} from 'lucide-react';
import { Business, CommunityStory } from '../../types';
import {
  generateSitemapXml,
  generateRobotsTxt,
  getSitemapStats,
  downloadTextFile,
  copySitemapToClipboard,
  DEFAULT_PRODUCTION_BASE_URL,
  buildSitemapEntries,
} from '../../lib/sitemapGenerator';
import { Button } from '../ui/Button';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  stories?: CommunityStory[];
}

export const SitemapModal: React.FC<SitemapModalProps> = ({
  isOpen,
  onClose,
  businesses,
  stories = [],
}) => {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'robots' | 'urls' | 'guide'>('sitemap');
  const [customDomain, setCustomDomain] = useState<string>(DEFAULT_PRODUCTION_BASE_URL);
  const [copiedType, setCopiedType] = useState<'xml' | 'robots' | 'url' | null>(null);
  const [includeImages, setIncludeImages] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : DEFAULT_PRODUCTION_BASE_URL;

  const currentOptions = useMemo(() => ({
    baseUrl: customDomain.trim() || DEFAULT_PRODUCTION_BASE_URL,
    businesses,
    stories,
    includeImages,
  }), [customDomain, businesses, stories, includeImages]);

  const sitemapXml = useMemo(() => generateSitemapXml(currentOptions), [currentOptions]);
  const robotsTxt = useMemo(() => generateRobotsTxt(customDomain.trim() || DEFAULT_PRODUCTION_BASE_URL), [customDomain]);
  const stats = useMemo(() => getSitemapStats(currentOptions), [currentOptions]);
  const entries = useMemo(() => buildSitemapEntries(currentOptions), [currentOptions]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries;
    const q = searchTerm.toLowerCase();
    return entries.filter((e) => e.loc.toLowerCase().includes(q));
  }, [entries, searchTerm]);

  if (!isOpen) return null;

  const handleCopyXml = async () => {
    const ok = await copySitemapToClipboard(sitemapXml);
    if (ok) {
      setCopiedType('xml');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleCopyRobots = async () => {
    const ok = await copySitemapToClipboard(robotsTxt);
    if (ok) {
      setCopiedType('robots');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleDownloadSitemap = () => {
    downloadTextFile(sitemapXml, 'sitemap.xml', 'application/xml');
  };

  const handleDownloadRobots = () => {
    downloadTextFile(robotsTxt, 'robots.txt', 'text/plain');
  };

  return (
    <div
      id="seo-sitemap-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-900 to-[#450202] text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-display font-black tracking-tight text-white">
                  SEO Sitemap & Robots.txt Generator
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Sitemaps.org 0.9
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Index all {stats.totalUrls} verified local URLs, categories, zones & community stories for Google & Bing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <Layers className="w-3.5 h-3.5 text-[#630303]" />
              <span>{stats.totalUrls} Total URLs</span>
            </div>
            <div className="flex items-center gap-1 text-stone-600">
              <Building2 className="w-3.5 h-3.5 text-stone-400" />
              <span>{stats.businessesCount} Businesses</span>
            </div>
            <div className="flex items-center gap-1 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{stats.zonesCount} Zones</span>
            </div>
            <div className="flex items-center gap-1 text-stone-600">
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              <span>{stats.categoriesCount} Categories</span>
            </div>
            <div className="flex items-center gap-1 text-stone-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{stats.totalImagesCount} Google Images</span>
            </div>
          </div>

          {/* Quick Domain Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-stone-500">Domain:</span>
            <select
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-[#630303] outline-none"
            >
              <option value={DEFAULT_PRODUCTION_BASE_URL}>Production (kwestdirectory.co.ke)</option>
              <option value={currentOrigin}>Current App URL ({currentOrigin})</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 px-4 sm:px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'sitemap'
                ? 'border-[#630303] text-[#630303]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>sitemap.xml ({stats.totalUrls})</span>
          </button>

          <button
            onClick={() => setActiveTab('robots')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'robots'
                ? 'border-[#630303] text-[#630303]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>robots.txt</span>
          </button>

          <button
            onClick={() => setActiveTab('urls')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'urls'
                ? 'border-[#630303] text-[#630303]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>URL Index List</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-[#630303] text-[#630303]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Search Engine Setup Guide</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50">
          {/* TAB 1: SITEMAP.XML PREVIEW & CONTROLS */}
          {activeTab === 'sitemap' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeImages}
                      onChange={(e) => setIncludeImages(e.target.checked)}
                      className="rounded border-stone-300 text-[#630303] focus:ring-[#630303]"
                    />
                    <span>Include Google Image Sitemaps (<code>&lt;image:loc&gt;</code> tags)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View /sitemap.xml</span>
                  </a>

                  <button
                    onClick={handleCopyXml}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                  >
                    {copiedType === 'xml' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'xml' ? 'XML Copied!' : 'Copy XML'}</span>
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDownloadSitemap}
                    className="bg-[#630303] hover:bg-[#7D0404] text-white"
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download sitemap.xml
                  </Button>
                </div>
              </div>

              {/* Code Box */}
              <div className="relative rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 p-4 font-mono text-[11px] sm:text-xs overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
                <pre className="text-emerald-400">{sitemapXml}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: ROBOTS.TXT PREVIEW & CONTROLS */}
          {activeTab === 'robots' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Standard Search Engine Robots Directives</h4>
                  <p className="text-[11px] text-stone-500">
                    Directs Googlebot, Bingbot, and other crawlers to all directory content and references the XML sitemap.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View /robots.txt</span>
                  </a>

                  <button
                    onClick={handleCopyRobots}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                  >
                    {copiedType === 'robots' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'robots' ? 'Copied!' : 'Copy robots.txt'}</span>
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDownloadRobots}
                    className="bg-[#630303] hover:bg-[#7D0404] text-white"
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download robots.txt
                  </Button>
                </div>
              </div>

              {/* Code Box */}
              <div className="relative rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 p-4 font-mono text-[11px] sm:text-xs overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
                <pre className="text-sky-300">{robotsTxt}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE URL INDEX LIST */}
          {activeTab === 'urls' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter indexed URLs by slug, category, or zone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs outline-none bg-transparent"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-stone-400 hover:text-stone-600 text-xs">
                    Clear
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100 text-xs">
                  {filteredEntries.map((entry, idx) => (
                    <div key={idx} className="p-3 hover:bg-stone-50/80 transition flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-stone-800 font-semibold truncate block">
                            {entry.loc}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-stone-400 mt-0.5">
                          <span>Priority: <strong className="text-stone-600">{entry.priority?.toFixed(2)}</strong></span>
                          <span>Freq: <strong className="text-stone-600">{entry.changefreq}</strong></span>
                          {entry.images && entry.images.length > 0 && (
                            <span className="text-emerald-700 font-semibold">{entry.images.length} images</span>
                          )}
                        </div>
                      </div>

                      <a
                        href={entry.loc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-[#630303] hover:bg-stone-100 transition"
                        title="Open URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}

                  {filteredEntries.length === 0 && (
                    <div className="p-8 text-center text-stone-400">
                      No URLs matching &quot;{searchTerm}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEBMASTER GUIDE */}
          {activeTab === 'guide' && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>How to Submit KWEST Sitemap to Google & Bing</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google Search Console</span>
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-stone-600 mt-2">
                    <li>Go to <strong>search.google.com/search-console</strong>.</li>
                    <li>Add property <code>https://kwestdirectory.co.ke</code>.</li>
                    <li>In the left sidebar, click on <strong>Sitemaps</strong>.</li>
                    <li>Enter <code>sitemap.xml</code> in the submission box.</li>
                    <li>Click <strong>Submit</strong> to start instant indexing.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bing Webmaster Tools</span>
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-stone-600 mt-2">
                    <li>Go to <strong>bing.com/webmasters</strong>.</li>
                    <li>Sign in and import your site from Google Search Console.</li>
                    <li>Go to <strong>Sitemaps &gt; Submit Sitemap</strong>.</li>
                    <li>Submit <code>https://kwestdirectory.co.ke/sitemap.xml</code>.</li>
                    <li>Bing will index listings across Bing, Yahoo & DuckDuckGo.</li>
                  </ol>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <strong>💡 Automatic Verification:</strong> The generated <code>/public/robots.txt</code> file already includes the canonical <code>Sitemap: https://kwestdirectory.co.ke/sitemap.xml</code> directive so search crawlers can discover it automatically upon visiting any page.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div>
            <span>Canonical: </span>
            <code className="text-stone-800 font-bold">{customDomain}/sitemap.xml</code>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
