import { describe, expect, it } from 'vitest';
import { evaluateAvailability, MAX_BOOKING_DURATION_MINUTES } from '@/utils/booking';
import type { Room } from '@/utils/booking';
import { ROOMS } from '@/data/rooms';
import { formatTime, MINUTES_PER_DAY } from '@/utils/time';

const CURRENT_TIME = 9 * 60; // 09:00 AM

const TESLA = ROOMS.find((room) => room.id === 'tesla-lecture-hall')!;

const openRoom: Room = {
  id: 'test-room',
  name: 'Test Room',
  capacity: 10,
  equipment: [],
  isBlocked: false,
  bookings: [
    { id: 'b1', title: 'Intro to Physics', start: 8 * 60 + 30, end: 10 * 60 },
    { id: 'b2', title: 'Faculty Meeting', start: 13 * 60, end: 14 * 60 + 30 },
  ],
};

describe('evaluateAvailability: fixture integrity', () => {
  it('uses Tesla Lecture Hall as the reference room with the correct bookings', () => {
    expect(TESLA.name).toBe('Tesla Lecture Hall');
    expect(TESLA.bookings).toEqual([
      expect.objectContaining({ title: 'Intro to Physics', start: 8 * 60 + 30, end: 10 * 60 }),
      expect.objectContaining({ title: 'Faculty Meeting', start: 13 * 60, end: 14 * 60 + 30 }),
    ]);
  });

  it('preserves the simulated current time of 09:00 AM', () => {
    expect(formatTime(CURRENT_TIME)).toBe('9:00 AM');
  });
});

describe('AC1: Start time must be in the future (PAST_START)', () => {
  it('accepts a start time after the current time', () => {
    const result = evaluateAvailability(10 * 60, 60, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
  });

  it('rejects a start time equal to the current time', () => {
    const result = evaluateAvailability(CURRENT_TIME, 60, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('PAST_START');
    expect(result.message).toContain('after the current time');
  });

  it('rejects a start time before the current time', () => {
    const result = evaluateAvailability(8 * 60, 60, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('PAST_START');
  });
});

describe('AC2: Duration must be > 0 and <= 120 minutes (INVALID_DURATION)', () => {
  it('rejects a duration of zero', () => {
    const result = evaluateAvailability(10 * 60, 0, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('INVALID_DURATION');
    expect(result.message).toContain('greater than zero');
  });

  it('rejects a negative duration', () => {
    const result = evaluateAvailability(10 * 60, -30, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('INVALID_DURATION');
  });

  it('accepts a duration of exactly 120 minutes', () => {
    const result = evaluateAvailability(11 * 60, MAX_BOOKING_DURATION_MINUTES, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
  });

  it('rejects a duration of 121 minutes', () => {
    const result = evaluateAvailability(11 * 60, 121, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('INVALID_DURATION');
    expect(result.message).toContain('at most 120 minutes');
  });
});

describe('AC3: Overlapping bookings are unavailable (OVERLAP)', () => {
  it('rejects a slot that overlaps the start of an existing booking', () => {
    const result = evaluateAvailability(9 * 60 + 30, 60, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('OVERLAP');
    expect(result.message).toContain('Intro to Physics');
  });

  it('rejects a slot fully contained inside an existing booking', () => {
    const result = evaluateAvailability(13 * 60 + 15, 30, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('OVERLAP');
    expect(result.message).toContain('Faculty Meeting');
  });

  it('rejects a slot that fully contains an existing booking', () => {
    const result = evaluateAvailability(12 * 60, 180, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('OVERLAP');
  });

  it('allows a slot that ends exactly when a booking starts (adjacent)', () => {
    const result = evaluateAvailability(11 * 60, 120, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
  });

  it('allows a slot that starts exactly when a booking ends (adjacent)', () => {
    const result = evaluateAvailability(10 * 60, 30, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
  });
});

describe('AC4: A blocked room is unavailable (BLOCKED)', () => {
  it('rejects any slot in a blocked room, even a valid one', () => {
    const blockedRoom: Room = { ...openRoom, isBlocked: true, bookings: [] };
    const result = evaluateAvailability(10 * 60, 60, blockedRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('BLOCKED');
    expect(result.message).toContain('blocked');
  });

  it('reports BLOCKED for the Tesla reference room when toggled blocked', () => {
    const blockedTesla: Room = { ...TESLA, isBlocked: true };
    const result = evaluateAvailability(15 * 60, 60, blockedTesla, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('BLOCKED');
  });
});

describe('AC5: Display a clear availability decision without changing bookings', () => {
  it('returns AVAILABLE with a human-readable message for a valid slot', () => {
    const result = evaluateAvailability(11 * 60, 60, TESLA, CURRENT_TIME);
    expect(result.isAvailable).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
    expect(result.message).toBeTruthy();
  });

  it('does not mutate the room bookings array', () => {
    const snapshot = TESLA.bookings.map((b) => ({ ...b }));
    evaluateAvailability(9 * 60 + 30, 60, TESLA, CURRENT_TIME);
    expect(TESLA.bookings).toEqual(snapshot);
  });

  it('always returns a non-empty message', () => {
    const valid = evaluateAvailability(11 * 60, 60, openRoom, CURRENT_TIME);
    expect(valid.message.length).toBeGreaterThan(0);
    const invalid = evaluateAvailability(9 * 60, 60, openRoom, CURRENT_TIME);
    expect(invalid.message.length).toBeGreaterThan(0);
  });
});

describe('AC6: Invalid input receives understandable feedback (INVALID_INPUT)', () => {
  it('rejects a non-integer start time', () => {
    const result = evaluateAvailability(10 * 60 + 0.5, 60, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
  });

  it('rejects a non-integer duration', () => {
    const result = evaluateAvailability(10 * 60, 30.5, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
  });

  it('rejects NaN start', () => {
    const result = evaluateAvailability(NaN, 60, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
  });

  it('rejects a start time at or past midnight boundary', () => {
    const result = evaluateAvailability(MINUTES_PER_DAY, 60, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
  });

  it('rejects a slot whose calculated end exceeds midnight', () => {
    const result = evaluateAvailability(23 * 60, 120, openRoom, CURRENT_TIME);
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
    expect(result.message).toContain('midnight');
  });
});

describe('reason code priority', () => {
  it('reports INVALID_INPUT before other failures', () => {
    const blockedRoom: Room = { ...openRoom, isBlocked: true };
    const result = evaluateAvailability(-5, 200, blockedRoom, CURRENT_TIME);
    expect(result.reasonCode).toBe('INVALID_INPUT');
  });

  it('reports PAST_START when start is past but duration is valid', () => {
    const result = evaluateAvailability(8 * 60, 60, openRoom, CURRENT_TIME);
    expect(result.reasonCode).toBe('PAST_START');
  });

  it('reports INVALID_DURATION when start is valid but duration is invalid', () => {
    const result = evaluateAvailability(10 * 60, 0, openRoom, CURRENT_TIME);
    expect(result.reasonCode).toBe('INVALID_DURATION');
  });
});
