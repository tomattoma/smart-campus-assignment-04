import { buildTimeOptions, formatTime, MINUTES_PER_DAY } from '@/utils/time';

interface TimeSlotFormProps {
  start: number;
  durationMinutes: number;
  onChange: (start: number, durationMinutes: number) => void;
}

const TIME_OPTIONS = buildTimeOptions();
const START_OPTIONS = TIME_OPTIONS.filter((minutes) => minutes < MINUTES_PER_DAY);
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const selectClass =
  'w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100';

export default function TimeSlotForm({ start, durationMinutes, onChange }: TimeSlotFormProps) {
  const calculatedEnd = start + durationMinutes;
  const endLabel =
    calculatedEnd > MINUTES_PER_DAY ? '—' : formatTime(calculatedEnd);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Start time</span>
          <select
            className={selectClass}
            value={start}
            onChange={(e) => onChange(Number(e.target.value), durationMinutes)}
          >
            {START_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {formatTime(minutes)}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Duration (minutes)</span>
          <input
            type="number"
            min={1}
            max={120}
            inputMode="numeric"
            value={durationMinutes}
            onChange={(e) => onChange(start, Number(e.target.value))}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {DURATION_OPTIONS.map((d) => {
          const active = durationMinutes === d;
          return (
            <button
              key={d}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(start, d)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
                active
                  ? 'bg-teal-600 text-white ring-teal-600'
                  : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'
              }`}
            >
              {d} min
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
        <span className="font-medium text-slate-500">Calculated end time:</span>
        <span className="font-semibold text-slate-900">{endLabel}</span>
      </div>
    </div>
  );
}
