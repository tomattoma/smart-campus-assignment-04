import { buildTimeOptions, formatTime, MINUTES_PER_DAY } from '@/utils/time';
import type { TimeSlot } from '@/utils/booking';

interface TimeSlotFormProps {
  slot: TimeSlot;
  onChange: (slot: TimeSlot) => void;
}

const TIME_OPTIONS = buildTimeOptions();
const START_OPTIONS = TIME_OPTIONS.filter((minutes) => minutes < MINUTES_PER_DAY);
const END_OPTIONS = TIME_OPTIONS.filter((minutes) => minutes > 0);

const selectClass =
  'w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100';

export default function TimeSlotForm({ slot, onChange }: TimeSlotFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Start time</span>
        <select
          className={selectClass}
          value={slot.start}
          onChange={(e) => onChange({ ...slot, start: Number(e.target.value) })}
        >
          {START_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {formatTime(minutes)}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">End time</span>
        <select
          className={selectClass}
          value={slot.end}
          onChange={(e) => onChange({ ...slot, end: Number(e.target.value) })}
        >
          {END_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes === MINUTES_PER_DAY ? 'Midnight' : formatTime(minutes)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
