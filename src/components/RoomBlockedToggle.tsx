import { Ban, Unlock } from 'lucide-react';

interface RoomBlockedToggleProps {
  isBlocked: boolean;
  onToggle: () => void;
}

export default function RoomBlockedToggle({ isBlocked, onToggle }: RoomBlockedToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        {isBlocked ? (
          <Ban className="h-4 w-4 text-red-600" aria-hidden="true" />
        ) : (
          <Unlock className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        }
        <span className="font-medium text-slate-700">
          Room blocked status
          <span className="ml-1 font-normal text-slate-500">(testing override)</span>
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isBlocked}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
          isBlocked ? 'bg-red-500' : 'bg-emerald-500'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isBlocked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
