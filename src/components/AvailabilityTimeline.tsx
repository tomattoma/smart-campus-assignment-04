import { formatTime, MINUTES_PER_DAY } from '@/utils/time';
import type { Booking, TimeSlot } from '@/utils/booking';

interface AvailabilityTimelineProps {
  bookings: Booking[];
  slot: TimeSlot;
  currentTime: number;
  isAvailable: boolean;
}

const TICK_HOURS = [0, 6, 12, 18, 24];

const toPercent = (minutes: number) => `${(minutes / MINUTES_PER_DAY) * 100}%`;

export default function AvailabilityTimeline({
  bookings,
  slot,
  currentTime,
  isAvailable,
}: AvailabilityTimelineProps) {
  const hasCandidate = slot.end > slot.start;
  const sortedBookings = [...bookings].sort((a, b) => a.start - b.start);

  return (
    <div className="space-y-5">
      <div className="relative pb-6">
        <div className="relative h-14 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-inset ring-slate-200">
          {sortedBookings.map((booking) => (
            <div
              key={booking.id}
              title={`${booking.title}: ${formatTime(booking.start)} - ${formatTime(booking.end)}`}
              className="absolute inset-y-0 bg-slate-400/70"
              style={{
                left: toPercent(booking.start),
                width: toPercent(booking.end - booking.start),
              }}
            />
          ))}

          {hasCandidate && (
            <div
              className={`absolute inset-y-1 rounded-lg transition-all duration-300 ${
                isAvailable
                  ? 'bg-emerald-500/80 ring-2 ring-emerald-600'
                  : 'bg-red-500/80 ring-2 ring-red-600'
              }`}
              style={{
                left: toPercent(slot.start),
                width: toPercent(slot.end - slot.start),
              }}
            />
          )}

          <div
            className="absolute inset-y-0 w-0.5 bg-slate-900"
            style={{ left: toPercent(currentTime) }}
            title={`Current time ${formatTime(currentTime)}`}
          />
        </div>

        <div className="relative mt-2 h-4 text-xs text-slate-500">
          {TICK_HOURS.map((hour) => (
            <span
              key={hour}
              className={`absolute top-0 whitespace-nowrap ${
                hour === 0 ? 'left-0' : hour === 24 ? 'right-0' : '-translate-x-1/2'
              }`}
              style={hour > 0 && hour < 24 ? { left: toPercent(hour * 60) } : undefined}
            >
              {formatTime(hour * 60)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-slate-400/70" aria-hidden="true" />
          Booked
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-emerald-500/80" aria-hidden="true" />
          Your slot (available)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-red-500/80" aria-hidden="true" />
          Your slot (unavailable)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-slate-900" aria-hidden="true" />
          Now
        </span>
      </div>

      {sortedBookings.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {sortedBookings.map((booking) => (
            <li key={booking.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <span className="font-medium text-slate-800">{booking.title}</span>
              <span className="whitespace-nowrap text-slate-500">
                {formatTime(booking.start)} - {formatTime(booking.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
