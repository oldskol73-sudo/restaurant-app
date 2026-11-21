import type { DayHours } from '../../restaurant.config';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hh}:${String(m).padStart(2, '0')} ${ap}` : `${hh} ${ap}`;
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** True when the hours run past midnight (e.g. 9 PM – 2 AM). */
const runsPastMidnight = (h: DayHours) => toMinutes(h.close) <= toMinutes(h.open);

const findDay = (hours: DayHours[], dayIndex: number) => hours.find((h) => h.day === DAY_NAMES[(dayIndex + 7) % 7]);

/** Hours for today's day of the week, or undefined when the cafe doesn't open today. */
export function todayHours(hours: DayHours[], now = new Date()) {
  return findDay(hours, now.getDay());
}

export function hoursLabel(h?: DayHours) {
  return !h || h.closed ? 'Closed' : `${fmtTime(h.open)} – ${fmtTime(h.close)}`;
}

export function isOpenNow(hours: DayHours[], now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();

  // Today's session, which started today
  const today = findDay(hours, now.getDay());
  if (today && !today.closed) {
    if (mins >= toMinutes(today.open) && (runsPastMidnight(today) || mins < toMinutes(today.close))) return true;
  }

  // Yesterday's session that ran past midnight into this morning
  const yesterday = findDay(hours, now.getDay() - 1);
  if (yesterday && !yesterday.closed && runsPastMidnight(yesterday)) {
    return mins < toMinutes(yesterday.close);
  }
  return false;
}
