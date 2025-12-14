import { ShiftType } from './types';
import { 
  Briefcase, 
  Sun, 
  Palmtree, 
  GraduationCap, 
  Users, 
  AlertOctagon, 
  Stethoscope, 
  Star,
  Megaphone,
  LifeBuoy
} from 'lucide-react';

export const SHIFT_COLORS: Record<ShiftType, string> = {
  [ShiftType.ORDINARY]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ShiftType.HOLIDAY]: 'bg-green-100 text-green-700 border-green-200',
  [ShiftType.LEAVE]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  [ShiftType.TRAINING]: 'bg-purple-100 text-purple-700 border-purple-200',
  [ShiftType.MEETING]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [ShiftType.STRIKE]: 'bg-red-100 text-red-700 border-red-200',
  [ShiftType.MEDICAL]: 'bg-pink-100 text-pink-700 border-pink-200',
  [ShiftType.SPECIAL]: 'bg-orange-100 text-orange-700 border-orange-200',
  [ShiftType.ASSEMBLY]: 'bg-amber-100 text-amber-800 border-amber-200',
  [ShiftType.SOCIAL_SAFETY]: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const SHIFT_DOT_COLORS: Record<ShiftType, string> = {
  [ShiftType.ORDINARY]: '#3b82f6',
  [ShiftType.HOLIDAY]: '#22c55e',
  [ShiftType.LEAVE]: '#eab308',
  [ShiftType.TRAINING]: '#a855f7',
  [ShiftType.MEETING]: '#6366f1',
  [ShiftType.STRIKE]: '#ef4444',
  [ShiftType.MEDICAL]: '#ec4899',
  [ShiftType.SPECIAL]: '#f97316',
  [ShiftType.ASSEMBLY]: '#d97706',
  [ShiftType.SOCIAL_SAFETY]: '#64748b',
};

export const SHIFT_ICONS: Record<ShiftType, any> = {
  [ShiftType.ORDINARY]: Briefcase,
  [ShiftType.HOLIDAY]: Sun,
  [ShiftType.LEAVE]: Palmtree,
  [ShiftType.TRAINING]: GraduationCap,
  [ShiftType.MEETING]: Users,
  [ShiftType.STRIKE]: AlertOctagon,
  [ShiftType.MEDICAL]: Stethoscope,
  [ShiftType.SPECIAL]: Star,
  [ShiftType.ASSEMBLY]: Megaphone,
  [ShiftType.SOCIAL_SAFETY]: LifeBuoy,
};