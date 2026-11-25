import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { ReasonCode } from '@/utils/booking';

interface BookingStatusProps {
  isAvailable: boolean;
  reasonCode: ReasonCode;
  message: string;
  errors: string[];
}

const REASON_LABELS: Record<ReasonCode, string> = {
  AVAILABLE: 'Available',
  OVERLAP: 'Overlap',
  BLOCKED: 'Blocked',
  INVALID_DURATION: 'Invalid Duration',
  PAST_START: 'Past Start',
  INVALID_INPUT: 'Invalid Input',
};

export default function BookingStatus({ isAvailable, reasonCode, message, errors }: BookingStatusProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          role="status"
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset transition-colors duration-300 ${
            isAvailable
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-red-50 text-red-700 ring-red-200'
          }`}
        >
          {isAvailable ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            <XCircle className="h-5 w-5" aria-hidden="true" />
          )}
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>

        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
            isAvailable
              ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
              : 'bg-slate-100 text-slate-600 ring-slate-200'
          }`}
        >
          {REASON_LABELS[reasonCode]}
        </span>
      </div>

      <p
        className={`text-sm font-medium ${
          isAvailable ? 'text-emerald-800' : 'text-slate-700'
        }`}
      >
        {message}
      </p>

      {!isAvailable && errors.length > 1 && (
        <ul className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4">
          {errors.map((error, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{error}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
