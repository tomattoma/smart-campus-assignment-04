import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface BookingStatusProps {
  isAvailable: boolean;
  errors: string[];
}

export default function BookingStatus({ isAvailable, errors }: BookingStatusProps) {
  return (
    <div className="space-y-4">
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

      {errors.length > 0 && (
        <ul className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4">
          {errors.map((error) => (
            <li key={error} className="flex items-start gap-2 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{error}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
