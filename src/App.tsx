import { useMemo, useState } from 'react';
import RoomBookingPanel from '@/components/RoomBookingPanel';
import RoomFilterControls from '@/components/RoomFilterControls';
import RoomHeader from '@/components/RoomHeader';
import RoomPicker from '@/components/RoomPicker';
import { CURRENT_TIME, ROOMS } from '@/data/rooms';
import type { TimeSlot } from '@/utils/booking';
import { collectEquipment, DEFAULT_ROOM_FILTERS, filterRooms } from '@/utils/roomFilters';
import type { RoomFilters } from '@/utils/roomFilters';

const INITIAL_SLOT: TimeSlot = { start: 10 * 60, end: 11 * 60 };
const EQUIPMENT_OPTIONS = collectEquipment(ROOMS);

function App() {
  const [filters, setFilters] = useState<RoomFilters>(DEFAULT_ROOM_FILTERS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS[0].id);
  const [slot, setSlot] = useState<TimeSlot>(INITIAL_SLOT);

  const matchingRooms = useMemo(() => filterRooms(ROOMS, filters), [filters]);
  const selectedRoom =
    matchingRooms.find((room) => room.id === selectedRoomId) ?? matchingRooms[0] ?? null;

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
                rooms={matchingRooms}
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
                slot={slot}
                currentTime={CURRENT_TIME}
                onSlotChange={setSlot}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
