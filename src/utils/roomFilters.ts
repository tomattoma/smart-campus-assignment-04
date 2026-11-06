import type { Room } from '@/utils/booking';

export interface RoomFilters {
  attendees: number;
  requiredEquipment: string[];
}

export const DEFAULT_ROOM_FILTERS: RoomFilters = {
  attendees: 1,
  requiredEquipment: [],
};

export function roomMatchesFilters(room: Room, filters: RoomFilters): boolean {
  const hasCapacity = room.capacity >= filters.attendees;
  const hasEquipment = filters.requiredEquipment.every((item) => room.equipment.includes(item));
  return hasCapacity && hasEquipment;
}

export function filterRooms(rooms: Room[], filters: RoomFilters): Room[] {
  return rooms.filter((room) => roomMatchesFilters(room, filters));
}

export function isDefaultRoomFilters(filters: RoomFilters): boolean {
  return (
    filters.attendees === DEFAULT_ROOM_FILTERS.attendees &&
    filters.requiredEquipment.length === 0
  );
}

export function normalizeAttendeeCount(value: number): number {
  return Math.max(1, Math.floor(value) || 1);
}

export function collectEquipment(rooms: Room[]): string[] {
  const unique = new Set(rooms.flatMap((room) => room.equipment));
  return [...unique].sort((a, b) => a.localeCompare(b));
}
