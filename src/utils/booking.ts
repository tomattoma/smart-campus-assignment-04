import { formatTime, MINUTES_PER_DAY } from '@/utils/time';

export const MAX_BOOKING_DURATION_MINUTES = 120;

export interface Booking {
  id: string;
  title: string;
  start: number;
  end: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  isBlocked: boolean;
  bookings: Booking[];
}

export interface TimeSlot {
  start: number;
  end: number;
}

export interface ValidationResult {
  isAvailable: boolean;
  errors: string[];
}

export function overlaps(slot: TimeSlot, booking: Booking): boolean {
  return slot.start < booking.end && booking.start < slot.end;
}

export function validateBookingSlot(
  slot: TimeSlot,
  room: Room,
  currentTime: number,
): ValidationResult {
  const errors: string[] = [];
  const { start, end } = slot;

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    errors.push('Start and end times must be whole minutes.');
  } else {
    if (start < 0 || end < 0 || start > MINUTES_PER_DAY || end > MINUTES_PER_DAY) {
      errors.push('Times must fall within a single day.');
    }
    if (end <= start) {
      errors.push('End time must be after the start time.');
    }
    if (start <= currentTime) {
      errors.push(`Start time must be after the current time (${formatTime(currentTime)}).`);
    }
    const duration = end - start;
    if (duration > MAX_BOOKING_DURATION_MINUTES) {
      errors.push(
        `Bookings can be at most ${MAX_BOOKING_DURATION_MINUTES} minutes. This slot is ${duration} minutes.`,
      );
    }
  }

  if (room.isBlocked) {
    errors.push(`${room.name} is blocked and cannot be booked.`);
  }

  if (end > start) {
    const conflict = room.bookings.find((booking) => overlaps(slot, booking));
    if (conflict) {
      errors.push(
        `This slot overlaps "${conflict.title}" (${formatTime(conflict.start)} - ${formatTime(conflict.end)}).`,
      );
    }
  }

  return { isAvailable: errors.length === 0, errors };
}
