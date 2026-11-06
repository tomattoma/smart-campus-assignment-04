export const MINUTES_PER_DAY = 1440;
export const SLOT_INTERVAL_MINUTES = 15;

export function formatTime(minutes: number): string {
  const normalized = minutes % MINUTES_PER_DAY;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours24 < 12 ? 'AM' : 'PM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${period}`;
}

export function buildTimeOptions(): number[] {
  const options: number[] = [];
  for (let m = 0; m <= MINUTES_PER_DAY; m += SLOT_INTERVAL_MINUTES) {
    options.push(m);
  }
  return options;
}
