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

export type ReasonCode =
  | 'AVAILABLE'
  | 'OVERLAP'
  | 'BLOCKED'
  | 'INVALID_DURATION'
  | 'PAST_START'
  | 'INVALID_INPUT';

export interface AvailabilityResult {
  isAvailable: boolean;
  reasonCode: ReasonCode;
  message: string;
  errors: string[];
}

const REASON_PRIORITY: Record<ReasonCode, number> = {
  INVALID_INPUT: 0,
  PAST_START: 1,
  INVALID_DURATION: 2,
  BLOCKED: 3,
  OVERLAP: 4,
  AVAILABLE: 5,
};

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

/**
 * Evaluates availability with a structured reason code and human-readable message.
 * The booking slot is derived from a start time and a duration in minutes.
 * Returns the highest-priority failure reason, or AVAILABLE when everything passes.
 * Does not mutate room bookings — it is a pure check used for display only.
 */
export function evaluateAvailability(
  start: number,
  durationMinutes: number,
  room: Room,
  currentTime: number,
): AvailabilityResult {
  const reasons: { code: ReasonCode; message: string }[] = [];

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(durationMinutes) ||
    !Number.isInteger(start) ||
    !Number.isInteger(durationMinutes)
  ) {
    reasons.push({
      code: 'INVALID_INPUT',
      message: 'Start time and duration must be whole numbers.',
    });
    return buildResult(reasons);
  }

  if (start < 0 || start >= MINUTES_PER_DAY) {
    reasons.push({
      code: 'INVALID_INPUT',
      message: 'Start time must fall within a single day (00:00–23:59).',
    });
    return buildResult(reasons);
  }

  if (durationMinutes <= 0) {
    reasons.push({
      code: 'INVALID_DURATION',
      message: 'Duration must be greater than zero.',
    });
  }

  if (durationMinutes > MAX_BOOKING_DURATION_MINUTES) {
    reasons.push({
      code: 'INVALID_DURATION',
      message: `Duration must be at most ${MAX_BOOKING_DURATION_MINUTES} minutes.`,
    });
  }

  if (start <= currentTime) {
    reasons.push({
      code: 'PAST_START',
      message: `Start time must be after the current time (${formatTime(currentTime)}).`,
    });
  }

  const end = start + durationMinutes;
  if (end > MINUTES_PER_DAY) {
    reasons.push({
      code: 'INVALID_INPUT',
      message: 'The calculated end time exceeds midnight. Choose a shorter duration or earlier start.',
    });
  }

  const slot: TimeSlot = { start, end };

  if (room.isBlocked) {
    reasons.push({
      code: 'BLOCKED',
      message: `${room.name} is blocked and cannot be booked.`,
    });
  }

  if (durationMinutes > 0 && end > start && end <= MINUTES_PER_DAY) {
    const conflict = room.bookings.find((booking) => overlaps(slot, booking));
    if (conflict) {
      reasons.push({
        code: 'OVERLAP',
        message: `This slot overlaps "${conflict.title}" (${formatTime(conflict.start)} - ${formatTime(conflict.end)}).`,
      });
    }
  }

  return buildResult(reasons);
}

function buildResult(reasons: { code: ReasonCode; message: string }[]): AvailabilityResult {
  if (reasons.length === 0) {
    return {
      isAvailable: true,
      reasonCode: 'AVAILABLE',
      message: 'This time slot is available.',
      errors: [],
    };
  }

  reasons.sort((a, b) => REASON_PRIORITY[a.code] - REASON_PRIORITY[b.code]);
  const primary = reasons[0];
  return {
    isAvailable: false,
    reasonCode: primary.code,
    message: primary.message,
    errors: reasons.map((r) => r.message),
  };
}
