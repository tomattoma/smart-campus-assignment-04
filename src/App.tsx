import { useMemo, useState } from 'react';
import RoomBookingPanel from '@/components/RoomBookingPanel';
import RoomFilterControls from '@/components/RoomFilterControls';
import RoomHeader from '@/components/RoomHeader';
import RoomPicker from '@/components/RoomPicker';
import { CURRENT_TIME, ROOMS } from '@/data/rooms';
import type { Room } from '@/utils/booking';
import { collectEquipment, DEFAULT_ROOM_FILTERS, filterRooms } from '@/utils/roomFilters';
import type { RoomFilters } from '@/utils/roomFilters';

const INITIAL_START = 10 * 60;
const INITIAL_DURATION = 60;
const EQUIPMENT_OPTIONS = collectEquipment(ROOMS);

function App() {
  const [filters, setFilters] = useState<RoomFilters>(DEFAULT_ROOM_FILTERS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS[0].id);
  const [start, setStart] = useState<number>(INITIAL_START);
  const [durationMinutes, setDurationMinutes] = useState<number>(INITIAL_DURATION);
  const [blockedOverrides, setBlockedOverrides] = useState<Record<string, boolean>>({});

  const matchingRooms = useMemo(() => filterRooms(ROOMS, filters), [filters]);

  const roomsWithOverrides = useMemo(
    () =>
      ROOMS.map((room) =>
        blockedOverrides[room.id] !== undefined
          ? { ...room, isBlocked: blockedOverrides[room.id] }
          : room,
      ),
    [blockedOverrides],
  );

  const selectedRoom: Room | null = useMemo(() => {
    const found = roomsWithOverrides.find((room) => room.id === selectedRoomId);
    if (found) return found;
    const matching = roomsWithOverrides.filter((room) =>
      matchingRooms.some((m) => m.id === room.id),
    );
    return matching[0] ?? null;
  }, [roomsWithOverrides, selectedRoomId, matchingRooms]);

  const handleSlotChange = (newStart: number, newDuration: number) => {
    setStart(newStart);
    setDurationMinutes(newDuration);
  };

  const handleToggleBlocked = () => {
    if (!selectedRoom) return;
    setBlockedOverrides((prev) => ({
      ...prev,
      [selectedRoom.id]: !selectedRoom.isBlocked,
    }));
  };

  const pickerRooms = useMemo(
    () => matchingRooms.map((m) => roomsWithOverrides.find((r) => r.id === m.id) ?? m),
    [matchingRooms, roomsWithOverrides],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:self-start">
            <RoomFilterControls
              filters={filters}
              equipmentOptions={EQUIPMENT_OPTIONS}
              onChange={setFilters}
            />
            <div className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-base font-semibold text-slate-900">
                Rooms{' '}
                <span className="font-normal text-slate-500">({matchingRooms.length})</span>
              </h2>
              <RoomPicker
                rooms={pickerRooms}
                selectedId={selectedRoom?.id ?? null}
                onSelect={setSelectedRoomId}
              />
            </div>
          </aside>

          {selectedRoom && (
            <section className="min-w-0 space-y-6">
              <RoomHeader room={selectedRoom} currentTime={CURRENT_TIME} />
              <RoomBookingPanel
                room={selectedRoom}
                start={start}
                durationMinutes={durationMinutes}
                currentTime={CURRENT_TIME}
                onSlotChange={handleSlotChange}
                onToggleBlocked={handleToggleBlocked}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
