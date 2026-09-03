import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/clipboard';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KWEST Directory runtime error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    try {
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => {
          Promise.all(keys.map((k) => caches.delete(k))).finally(() => {
            location.reload();
          });
        }).catch(() => {
          location.reload();
        });
        return;
      }
    } catch {
      // ignore
    }
    location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <h1 className="text-xl font-bold text-stone-900 mb-2">
              Kahawa West Directory
            </h1>
            <p className="text-sm text-stone-600 mb-5 leading-relaxed">
              We encountered a temporary interface synchronization glitch while loading modules.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs bg-stone-50 p-3 rounded-lg border border-stone-200 text-rose-700 overflow-x-auto max-h-32 mb-5">
                {this.state.error.message}
              </pre>
            )}
            <button
              id="error-boundary-reload-btn"
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-[#0D6E44] hover:bg-[#074E2E] text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
            >
              Reload Directory
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>,
  );
}
