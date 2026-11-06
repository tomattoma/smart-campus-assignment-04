import { describe, expect, it } from 'vitest';
import { MAX_BOOKING_DURATION_MINUTES, validateBookingSlot } from '@/utils/booking';
import type { Room, TimeSlot } from '@/utils/booking';

const CURRENT_TIME = 9 * 60;

const openRoom: Room = {
  id: 'test-room',
  name: 'Test Room',
  capacity: 10,
  equipment: [],
  isBlocked: false,
  bookings: [
    { id: 'b1', title: 'Morning Class', start: 8 * 60 + 30, end: 10 * 60 },
    { id: 'b2', title: 'Afternoon Meeting', start: 13 * 60, end: 14 * 60 + 30 },
  ],
};

const slot = (start: number, end: number): TimeSlot => ({ start, end });

describe('AC1: time range and current-time rules', () => {
  it('accepts a slot that starts after the current time and ends later', () => {
    const result = validateBookingSlot(slot(10 * 60, 11 * 60), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a start time equal to the current time', () => {
    const result = validateBookingSlot(slot(CURRENT_TIME, 11 * 60), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors.some((e) => e.includes('after the current time'))).toBe(true);
  });

  it('rejects a start time before the current time', () => {
    const result = validateBookingSlot(slot(8 * 60, 9 * 60 + 30), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors.some((e) => e.includes('after the current time'))).toBe(true);
  });

  it('rejects an end time that is not after the start time', () => {
    const result = validateBookingSlot(slot(11 * 60, 11 * 60), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors).toContain('End time must be after the start time.');
  });

  it('rejects an end time before the start time', () => {
    const result = validateBookingSlot(slot(12 * 60, 11 * 60), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors).toContain('End time must be after the start time.');
  });

  it('rejects negative minutes', () => {
    const result = validateBookingSlot(slot(-30, 60), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors).toContain('Times must fall within a single day.');
  });

  it('rejects times past midnight (1440 minutes)', () => {
    const result = validateBookingSlot(slot(23 * 60, 24 * 60 + 15), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors).toContain('Times must fall within a single day.');
  });

  it('accepts an end time of exactly 1440 minutes', () => {
    const lateRoom: Room = { ...openRoom, bookings: [] };
    const result = validateBookingSlot(slot(23 * 60, 24 * 60), lateRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(true);
  });

  it('rejects non-integer minutes', () => {
    const result = validateBookingSlot(slot(10 * 60 + 0.5, 11 * 60), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors).toContain('Start and end times must be whole minutes.');
  });
});

describe('AC2: maximum slot duration', () => {
  it('accepts a slot of exactly 120 minutes', () => {
    const emptyRoom: Room = { ...openRoom, bookings: [] };
    const result = validateBookingSlot(
      slot(10 * 60, 10 * 60 + MAX_BOOKING_DURATION_MINUTES),
      emptyRoom,
      CURRENT_TIME,
    );
    expect(result.isAvailable).toBe(true);
  });

  it('rejects a slot of 121 minutes', () => {
    const emptyRoom: Room = { ...openRoom, bookings: [] };
    const result = validateBookingSlot(slot(10 * 60, 10 * 60 + 121), emptyRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors.some((e) => e.includes('at most 120 minutes') && e.includes('121'))).toBe(
      true,
    );
  });
});

describe('AC3: blocked room status', () => {
  it('rejects any slot in a blocked room, even a valid one', () => {
    const blockedRoom: Room = { ...openRoom, isBlocked: true, bookings: [] };
    const result = validateBookingSlot(slot(10 * 60, 11 * 60), blockedRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors).toContain('Test Room is blocked and cannot be booked.');
  });
});

describe('AC4: overlap with existing bookings', () => {
  it('rejects a slot that overlaps the start of an existing booking', () => {
    const result = validateBookingSlot(slot(9 * 60 + 30, 10 * 60 + 30), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors.some((e) => e.includes('Morning Class'))).toBe(true);
  });

  it('rejects a slot fully contained inside an existing booking', () => {
    const result = validateBookingSlot(slot(13 * 60 + 15, 14 * 60), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors.some((e) => e.includes('Afternoon Meeting'))).toBe(true);
  });

  it('rejects a slot that fully contains an existing booking', () => {
    const result = validateBookingSlot(slot(12 * 60, 15 * 60), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors.some((e) => e.includes('Afternoon Meeting'))).toBe(true);
  });

  it('allows a slot that ends exactly when a booking starts', () => {
    const result = validateBookingSlot(slot(11 * 60, 13 * 60), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(true);
  });

  it('allows a slot that starts exactly when a booking ends', () => {
    const result = validateBookingSlot(slot(10 * 60, 10 * 60 + 30), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(true);
  });
});

describe('AC5: status and error reporting', () => {
  it('reports unavailable with at least one message whenever a rule fails', () => {
    const result = validateBookingSlot(slot(9 * 60, 9 * 60 + 30), openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('reports available with no messages when every rule passes', () => {
    const result = validateBookingSlot(slot(11 * 60, 12 * 60), openRoom, CURRENT_TIME);
    expect(result).toEqual({ isAvailable: true, errors: [] });
  });

  it('reports every failing rule at once rather than only the first', () => {
    const blockedRoom: Room = { ...openRoom, isBlocked: true };
    const result = validateBookingSlot(slot(8 * 60, 8 * 60 + 150), blockedRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
