import { Ban, Building2, Clock, Mic, Monitor, Users } from 'lucide-react';
import type { Room } from '@/utils/booking';
import { formatTime } from '@/utils/time';

interface RoomHeaderProps {
  room: Room;
  currentTime: number;
}

export default function RoomHeader({ room, currentTime }: RoomHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-teal-700">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Smart Campus Rooms
          </div>
          <h1 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
            {room.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Capacity {room.capacity}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Current time {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {room.isBlocked && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200">
            <Ban className="h-4 w-4" aria-hidden="true" />
            Room blocked
          </span>
        )}
      </div>

      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Room equipment">
        {room.equipment.map((item) => (
          <li
            key={item}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
          >
            {item === 'Microphone' ? (
              <Mic className="h-4 w-4 text-slate-500" aria-hidden="true" />
            ) : (
              <Monitor className="h-4 w-4 text-slate-500" aria-hidden="true" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </header>
  );
}
