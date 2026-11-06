import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import AvailabilityTimeline from '@/components/AvailabilityTimeline';
import BookingStatus from '@/components/BookingStatus';
import TimeSlotForm from '@/components/TimeSlotForm';
import { validateBookingSlot } from '@/utils/booking';
import type { Room, TimeSlot } from '@/utils/booking';

interface RoomBookingPanelProps {
  room: Room;
  slot: TimeSlot;
  currentTime: number;
  onSlotChange: (slot: TimeSlot) => void;
}

export default function RoomBookingPanel({
  room,
  slot,
  currentTime,
  onSlotChange,
}: RoomBookingPanelProps) {
  const validation = useMemo(
    () => validateBookingSlot(slot, room, currentTime),
    [slot, room, currentTime],
  );

  return (
    <div className="space-y-6">
      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-teal-700" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900">Check a time slot</h2>
        </div>

        <TimeSlotForm slot={slot} onChange={onSlotChange} />

        <BookingStatus isAvailable={validation.isAvailable} errors={validation.errors} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">Today's schedule</h2>
        <AvailabilityTimeline
          bookings={room.bookings}
          slot={slot}
          currentTime={currentTime}
          isAvailable={validation.isAvailable}
        />
      </section>
    </div>
  );
}
