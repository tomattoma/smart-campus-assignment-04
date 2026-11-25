import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import AvailabilityTimeline from '@/components/AvailabilityTimeline';
import BookingStatus from '@/components/BookingStatus';
import RoomBlockedToggle from '@/components/RoomBlockedToggle';
import TimeSlotForm from '@/components/TimeSlotForm';
import { evaluateAvailability } from '@/utils/booking';
import type { Room } from '@/utils/booking';
import { formatTime, MINUTES_PER_DAY } from '@/utils/time';

interface RoomBookingPanelProps {
  room: Room;
  start: number;
  durationMinutes: number;
  currentTime: number;
  onSlotChange: (start: number, durationMinutes: number) => void;
  onToggleBlocked: () => void;
}

export default function RoomBookingPanel({
  room,
  start,
  durationMinutes,
  currentTime,
  onSlotChange,
  onToggleBlocked,
}: RoomBookingPanelProps) {
  const availability = useMemo(
    () => evaluateAvailability(start, durationMinutes, room, currentTime),
    [start, durationMinutes, room, currentTime],
  );

  const slot = { start, end: start + durationMinutes };
  const hasCandidate = durationMinutes > 0 && slot.end > slot.start && slot.end <= MINUTES_PER_DAY;

  return (
    <div className="space-y-6">
      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-teal-700" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900">Check a time slot</h2>
        </div>

        <TimeSlotForm start={start} durationMinutes={durationMinutes} onChange={onSlotChange} />

        <RoomBlockedToggle isBlocked={room.isBlocked} onToggle={onToggleBlocked} />

        <BookingStatus
          isAvailable={availability.isAvailable}
          reasonCode={availability.reasonCode}
          message={availability.message}
          errors={availability.errors}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Today's schedule</h2>
          <span className="text-sm text-slate-500">
            Slot: {formatTime(Math.min(start, MINUTES_PER_DAY))} –{' '}
            {hasCandidate ? formatTime(slot.end) : '—'}
          </span>
        </div>
        <AvailabilityTimeline
          bookings={room.bookings}
          slot={hasCandidate ? slot : { start: 0, end: 0 }}
          currentTime={currentTime}
          isAvailable={availability.isAvailable}
        />
      </section>
    </div>
  );
}
