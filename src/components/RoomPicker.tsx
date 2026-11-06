import { Ban, CheckCircle2, Search } from 'lucide-react';
import type { Room } from '@/utils/booking';

interface RoomPickerProps {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (roomId: string) => void;
}

export default function RoomPicker({ rooms, selectedId, onSelect }: RoomPickerProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
          <Search className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="font-medium text-slate-900">No rooms match these filters</p>
        <p className="text-sm text-slate-600">
          Try lowering the attendee count or removing an equipment requirement.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Rooms">
      {rooms.map((room) => {
        const selected = room.id === selectedId;
        return (
          <li key={room.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(room.id)}
              className={`group w-full rounded-xl border px-4 py-3.5 text-left transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
                selected
                  ? 'border-teal-500 bg-teal-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{room.name}</p>
                  <p className="mt-0.5 text-sm text-slate-600">Up to {room.capacity} people</p>
                </div>
                {room.isBlocked ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                    <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                    Blocked
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Open
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">{room.equipment.join(' · ')}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
