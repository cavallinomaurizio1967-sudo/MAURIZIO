export enum ShiftType {
  ORDINARY = 'Ordinario',
  HOLIDAY = 'Festivo',
  LEAVE = 'Ferie',
  TRAINING = 'Formazione',
  MEETING = 'Riunione',
  STRIKE = 'Sciopero',
  MEDICAL = 'Visita Medica',
  SPECIAL = 'Evento Speciale',
  ASSEMBLY = 'Assemblea',
  SOCIAL_SAFETY = 'Ammortizzatore Sociale'
}

export interface Shift {
  id: string;
  date: string; // ISO YYYY-MM-DD
  startTime: string; // HH:mm (can be empty string if customDuration is set)
  endTime: string; // HH:mm (can be empty string if customDuration is set)
  type: ShiftType;
  description: string;
  breakMinutes?: number; // Duration of break in minutes
  customDuration?: number; // Manual override for total hours (e.g. 8 hours)
}

export interface ShiftStats {
  type: ShiftType;
  hours: number;
  count: number;
}