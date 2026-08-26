import React, { useState, useEffect } from 'react';
import { Bell, X, ArrowRight, Sparkles } from 'lucide-react';
import { AppNotification } from '../../lib/notifications';

interface NotificationToastProps {
  notification: AppNotification | null;
  onOpenCenter: () => void;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onOpenCenter,
  onDismiss,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm w-full bg-[#1A0101] text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 animate-in slide-in-from-bottom-5 fade-in duration-300 font-sans backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-700/80 text-emerald-300 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bell className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {notification.badge || 'Community Update'}
            </span>
            <button
              onClick={onDismiss}
              className="text-stone-400 hover:text-white p-0.5 rounded transition"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-stone-100 leading-snug line-clamp-1 mb-0.5">
            {notification.title}
          </h4>

          <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed mb-2.5">
            {notification.body}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDismiss();
                onOpenCenter();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95 shadow-xs"
            >
              <span>View Notice</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onDismiss}
              className="text-xs text-stone-400 hover:text-stone-200 px-2 py-1 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
