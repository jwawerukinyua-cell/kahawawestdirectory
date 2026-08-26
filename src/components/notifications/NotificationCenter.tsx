import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Sparkles,
  Zap,
  Calendar,
  ShoppingBag,
  Info,
  Send,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { CommunityUpdate } from '../../types';
import {
  AppNotification,
  getStoredNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  clearNotifications,
  generateSearchMatchAlerts,
  requestNotificationPermission,
  sendNativeNotification,
  getNotificationPermission,
} from '../../lib/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  updates: CommunityUpdate[];
  onSelectUpdate?: (update: CommunityUpdate) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  updates,
  onSelectUpdate,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());
  const [filterType, setFilterType] = useState<'all' | 'updates' | 'suggested'>('all');
  const [pushStatus, setPushStatus] = useState<string>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    // Generate any smart search match alert from recent searches
    generateSearchMatchAlerts(updates);
    setNotifications(getStoredNotifications());
    setPushStatus(getNotificationPermission());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setNotifications(e.detail);
      }
    };
    window.addEventListener('kwest_notifications_updated', handleUpdate);
    return () => window.removeEventListener('kwest_notifications_updated', handleUpdate);
  }, [updates, isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const handleClearAll = () => {
    const updated = clearNotifications();
    setNotifications(updated);
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    setPushStatus(granted ? 'granted' : 'denied');
    if (granted) {
      sendNativeNotification('🔔 Kahawa West Alerts Enabled', {
        body: 'You will now receive real-time estate notices and power updates in KWEST PWA.',
      });
    }
  };

  const handleSendTestPush = async () => {
    setTestSent(true);
    await sendNativeNotification('⚡ KPLC Power Notice: Bima Road', {
      body: 'Scheduled transformer maintenance today. Cyber cafes & welding hubs on standby generator.',
    });
    setTimeout(() => setTestSent(false), 3000);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'updates') return n.type === 'update' || n.type === 'deal';
    if (filterType === 'suggested') return n.type === 'search_match';
    return true;
  });

  return (
    <div
      id="notification-center-drawer"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#630303]/30 text-slate-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#4D0202] text-white px-5 py-4 flex items-center justify-between border-b border-[#630303] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">
                  Community Alerts & Notices
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-rose-200/90">
                Live estate updates & personalized search alerts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#630303] hover:bg-[#7D0404] text-stone-200 hover:text-white transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PWA Push Notification Toggle Banner */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-950 to-stone-900 text-white border-b border-emerald-900/60 flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold block text-emerald-300">
              {pushStatus === 'granted' ? '✓ PWA Push Notifications Active' : 'Enable Instant Phone Alerts'}
            </span>
            <span className="text-[11px] text-stone-400">
              Get notified of utility cuts & estate deals.
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {pushStatus !== 'granted' ? (
              <button
                onClick={handleEnablePush}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs active:scale-95"
              >
                Enable
              </button>
            ) : (
              <button
                onClick={handleSendTestPush}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold border border-emerald-500/30 transition active:scale-95"
              >
                {testSent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5" />}
                <span>{testSent ? 'Sent!' : 'Test'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Quick Actions */}
        <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filterType === 'all'
                  ? 'bg-[#630303] text-white'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('suggested')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                filterType === 'suggested'
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>For You</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Read all</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-stone-500 hover:text-stone-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-stone-400 opacity-60" />
              <p className="text-xs font-semibold">No notifications right now</p>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                Check back for fresh utility notices, community tournament dates, and deals from local vendors.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isSearchMatch = notif.type === 'search_match';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer relative ${
                    notif.isRead
                      ? 'bg-white border-stone-200 text-stone-700'
                      : isSearchMatch
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                      : 'bg-rose-50/60 border-rose-200 text-slate-900 shadow-xs'
                  }`}
                >
                  {/* Unread indicator */}
                  {!notif.isRead && (
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#25D366]" />
                  )}

                  <div className="flex items-start gap-2.5">
                    {/* Type Icon */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSearchMatch
                          ? 'bg-emerald-200 text-emerald-800'
                          : notif.type === 'deal'
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isSearchMatch ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : notif.type === 'deal' ? (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {notif.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                              isSearchMatch
                                ? 'bg-emerald-200 text-emerald-900'
                                : 'bg-stone-200 text-stone-800'
                            }`}
                          >
                            {notif.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 font-medium">
                          {notif.time}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold leading-snug mb-1">
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        {notif.body}
                      </p>

                      {notif.relatedZone && (
                        <span className="inline-block text-[10px] font-semibold text-emerald-800 mt-2">
                          📍 {notif.relatedZone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 text-center text-[11px] text-stone-500">
          Notifications are localized to Kahawa West, Nairobi.
        </div>
      </div>
    </div>
  );
};
