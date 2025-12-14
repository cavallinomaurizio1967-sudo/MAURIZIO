import { isSameDay, addDays } from 'date-fns';

export const getHoliday = (date: Date): string | null => {
  const day = date.getDate();
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();

  // Fixed holidays
  if (day === 1 && month === 0) return "Capodanno";
  if (day === 6 && month === 0) return "Epifania";
  if (day === 25 && month === 3) return "Liberazione";
  if (day === 1 && month === 4) return "Festa del Lavoro";
  if (day === 2 && month === 5) return "Festa Repubblica";
  if (day === 15 && month === 7) return "Ferragosto";
  if (day === 1 && month === 10) return "Ognissanti";
  if (day === 8 && month === 11) return "Immacolata";
  if (day === 25 && month === 11) return "Natale";
  if (day === 26 && month === 11) return "S. Stefano";

  // Variable holidays (Easter)
  const easter = getEaster(year);
  const pasquetta = addDays(easter, 1);

  if (isSameDay(date, easter)) return "Pasqua";
  if (isSameDay(date, pasquetta)) return "Pasquetta";

  return null;
};

// Meeus/Jones/Butcher's algorithm for Gregorian Easter
function getEaster(year: number) {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
}