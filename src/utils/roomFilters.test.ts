import { describe, expect, it } from 'vitest';
import { ROOMS } from '@/data/rooms';
import { validateBookingSlot } from '@/utils/booking';
import {
  collectEquipment,
  DEFAULT_ROOM_FILTERS,
  filterRooms,
  isDefaultRoomFilters,
  normalizeAttendeeCount,
  roomMatchesFilters,
} from '@/utils/roomFilters';
import type { RoomFilters } from '@/utils/roomFilters';

const CURRENT_TIME = 9 * 60;

const filters = (overrides: Partial<RoomFilters>): RoomFilters => ({
  ...DEFAULT_ROOM_FILTERS,
  ...overrides,
});

const idsOf = (rooms: { id: string }[]) => rooms.map((room) => room.id).sort();

const TESLA = 'tesla-lecture-hall';
const ADA = 'ada-seminar-room';
const BOHR = 'bohr-auditorium';

describe('catalog fixture', () => {
  it('contains at least four rooms with unique ids', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ROOMS.map((room) => room.id)).size).toBe(ROOMS.length);
  });

  it('includes at least one blocked room', () => {
    expect(ROOMS.some((room) => room.isBlocked)).toBe(true);
  });
});

describe('F1: capacity threshold', () => {
  it('keeps rooms whose capacity is greater than or equal to the attendee count', () => {
    expect(idsOf(filterRooms(ROOMS, filters({ attendees: 50 })))).toEqual(
      [BOHR, TESLA].sort(),
    );
  });

  it('excludes rooms smaller than the attendee count', () => {
    expect(roomMatchesFilters(ROOMS[2], filters({ attendees: 13 }))).toBe(false);
  });

  it('keeps every room when the attendee count is 1', () => {
    expect(filterRooms(ROOMS, filters({ attendees: 1 }))).toHaveLength(ROOMS.length);
  });
});

describe('F2: equipment requirements', () => {
  it('requires every selected equipment item, not just one', () => {
    expect(
      idsOf(filterRooms(ROOMS, filters({ requiredEquipment: ['Projector', 'Microphone'] }))),
    ).toEqual([BOHR, TESLA].sort());
  });

  it('excludes a room missing any one of the selected items', () => {
    expect(
      idsOf(filterRooms(ROOMS, filters({ requiredEquipment: ['Projector', 'Video Conferencing'] }))),
    ).toEqual([BOHR]);
  });

  it('ignores equipment when no items are selected', () => {
    expect(filterRooms(ROOMS, filters({ requiredEquipment: [] }))).toHaveLength(ROOMS.length);
  });

  it('combines capacity and equipment filters with AND logic', () => {
    expect(
      idsOf(filterRooms(ROOMS, filters({ attendees: 30, requiredEquipment: ['Computers'] }))),
    ).toEqual([]);
  });
});

describe('F3: blocked status', () => {
  const bohr = ROOMS.find((room) => room.id === BOHR)!;

  it('never reports a blocked room as available, for any time slot', () => {
    const validSlots = [
      { start: 10 * 60, end: 11 * 60 },
      { start: 16 * 60, end: 17 * 60 },
      { start: 9 * 60 + 15, end: 10 * 60 },
    ];
    for (const slot of validSlots) {
      expect(validateBookingSlot(slot, bohr, CURRENT_TIME).isAvailable).toBe(false);
    }
  });

  it('keeps blocked rooms in the filter results so they can be shown as blocked', () => {
    expect(idsOf(filterRooms(ROOMS, filters({ attendees: 200 })))).toContain(BOHR);
  });
});

describe('F4: empty state', () => {
  it('returns an empty list when no room meets the capacity requirement', () => {
    expect(filterRooms(ROOMS, filters({ attendees: 500 }))).toEqual([]);
  });

  it('returns an empty list when no room has the full equipment combination', () => {
    expect(
      filterRooms(ROOMS, filters({ requiredEquipment: ['Computers', 'Microphone'] })),
    ).toEqual([]);
  });

  it('returns an empty list for an empty room collection', () => {
    expect(filterRooms([], DEFAULT_ROOM_FILTERS)).toEqual([]);
  });
});

describe('filter state helpers', () => {
  it('detects default filter state', () => {
    expect(isDefaultRoomFilters(DEFAULT_ROOM_FILTERS)).toBe(true);
    expect(isDefaultRoomFilters(filters({ attendees: 2 }))).toBe(false);
    expect(isDefaultRoomFilters(filters({ requiredEquipment: ['Projector'] }))).toBe(false);
  });

  it('normalizes attendee input to a whole number of at least 1', () => {
    expect(normalizeAttendeeCount(0)).toBe(1);
    expect(normalizeAttendeeCount(-5)).toBe(1);
    expect(normalizeAttendeeCount(NaN)).toBe(1);
    expect(normalizeAttendeeCount(7.9)).toBe(7);
    expect(normalizeAttendeeCount(42)).toBe(42);
  });

  it('collects unique, sorted equipment across rooms', () => {
    const equipment = collectEquipment(ROOMS);
    expect(new Set(equipment).size).toBe(equipment.length);
    expect(equipment).toEqual([...equipment].sort((a, b) => a.localeCompare(b)));
    expect(equipment).toContain('Projector');
  });

  it('identifies the Ada seminar room as the smallest catalog option', () => {
    expect(ROOMS.find((room) => room.id === ADA)!.capacity).toBe(
      Math.min(...ROOMS.map((room) => room.capacity)),
    );
  });
});
