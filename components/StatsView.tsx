import React, { useMemo } from 'react';
import { Shift, ShiftType } from '../types';
import { SHIFT_DOT_COLORS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { differenceInMinutes } from 'date-fns';

interface StatsViewProps {
  shifts: Shift[];
  currentMonth: Date;
}

export const StatsView: React.FC<StatsViewProps> = ({ shifts, currentMonth }) => {
  
  const statsData = useMemo(() => {
    const data: Record<string, number> = {};
    
    // Filter shifts for current month
    const monthShifts = shifts.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });

    monthShifts.forEach(shift => {
      let hours = 0;

      if (shift.customDuration && shift.customDuration > 0) {
        // If manual duration is set, use it directly
        hours = shift.customDuration;
      } else if (shift.startTime && shift.endTime) {
         // Manual parsing instead of date-fns parse to avoid export issues
        const [startHours, startMinutes] = shift.startTime.split(':').map(Number);
        const start = new Date();
        start.setHours(startHours, startMinutes, 0, 0);

        const [endHours, endMinutes] = shift.endTime.split(':').map(Number);
        let end = new Date();
        end.setHours(endHours, endMinutes, 0, 0);
        
        // Handle overnight shifts roughly for stats
        if (end < start) {
           end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
        }

        const rawMinutes = differenceInMinutes(end, start);
        // Subtract break minutes, ensuring we don't go below 0
        const breakMin = shift.breakMinutes || 0;
        const netMinutes = Math.max(0, rawMinutes - breakMin);
        hours = netMinutes / 60;
      }
      
      if (hours > 0) {
        if (!data[shift.type]) {
          data[shift.type] = 0;
        }
        data[shift.type] += hours;
      }
    });

    return Object.entries(data).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(1))
    })).filter(item => item.value > 0);
  }, [shifts, currentMonth]);

  const totalHours = statsData.reduce((acc, curr) => acc + curr.value, 0);

  if (statsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p>Nessun turno per questo mese.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Riepilogo Mensile</h3>
      
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)} <span className="text-sm font-normal text-gray-500">Ore Totali</span></div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statsData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {statsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SHIFT_DOT_COLORS[entry.name as ShiftType] || '#ccc'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-3">
        {statsData.map((item) => (
            <div key={item.name} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SHIFT_DOT_COLORS[item.name as ShiftType] }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}h</span>
            </div>
        ))}
      </div>
    </div>
  );
};