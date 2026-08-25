import React from 'react';
import { SearchX, PlusCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  onReset: () => void;
  onListBusiness: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset, onListBusiness }) => {
  return (
    <div id="directory-empty-state" className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-1">No Listings Found</h3>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        We couldn't find any businesses matching your search or filters. Try adjusting your estate zone or search keywords, or list your business!
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset All Filters
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onListBusiness}
          icon={<PlusCircle className="w-4 h-4" />}
        >
          Add This Business
        </Button>
      </div>
    </div>
  );
};
