import { RotateCcw, Users } from 'lucide-react';
import {
  DEFAULT_ROOM_FILTERS,
  isDefaultRoomFilters,
  normalizeAttendeeCount,
} from '@/utils/roomFilters';
import type { RoomFilters } from '@/utils/roomFilters';

interface RoomFilterControlsProps {
  filters: RoomFilters;
  equipmentOptions: string[];
  onChange: (filters: RoomFilters) => void;
}

export default function RoomFilterControls({
  filters,
  equipmentOptions,
  onChange,
}: RoomFilterControlsProps) {
  const toggleEquipment = (item: string) => {
    const next = filters.requiredEquipment.includes(item)
      ? filters.requiredEquipment.filter((existing) => existing !== item)
      : [...filters.requiredEquipment, item];
    onChange({ ...filters, requiredEquipment: next });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Filter rooms</h2>
        {!isDefaultRoomFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_ROOM_FILTERS)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-teal-700 transition hover:bg-teal-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-100"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Attendees</span>
        <div className="relative">
          <Users
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={filters.attendees}
            onChange={(e) =>
              onChange({ ...filters, attendees: normalizeAttendeeCount(Number(e.target.value)) })
            }
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-base text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
          />
        </div>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Required equipment</legend>
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((item) => {
            const active = filters.requiredEquipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => toggleEquipment(item)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
                  active
                    ? 'bg-teal-600 text-white ring-teal-600'
                    : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
