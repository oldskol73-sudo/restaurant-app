import type { DayHours } from '../../restaurant.config';

export function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hh}:${String(m).padStart(2, '0')} ${ap}` : `${hh} ${ap}`;
}

export function todayHours(hours: DayHours[], now = new Date()) {
  const idx = (now.getDay() + 6) % 7; // Monday = 0
  return hours[idx];
}

export function hoursLabel(h: DayHours) {
  return h.closed ? 'Closed' : `${fmtTime(h.open)} – ${fmtTime(h.close)}`;
}

export function isOpenNow(hours: DayHours[], now = new Date()) {
  const h = todayHours(hours, now);
  if (!h || h.closed) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = h.open.split(':').map(Number);
  const [ch, cm] = h.close.split(':').map(Number);
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
}
