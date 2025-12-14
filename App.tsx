import React, { useState, useEffect, useMemo } from 'react';
import { Shift, ShiftType } from './types';
import { SHIFT_COLORS, SHIFT_DOT_COLORS } from './constants';
import { ShiftForm } from './components/ShiftForm';
import { StatsView } from './components/StatsView';
import { getHoliday } from './services/holidayService';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  PieChart, 
  Trash2,
  Clock,
  Download,
  Share2
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import it from 'date-fns/locale/it';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function App() {
  // State
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('shift_app_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDateForForm, setSelectedDateForForm] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'calendar' | 'stats'>('calendar');
  const [selectedDayShifts, setSelectedDayShifts] = useState<{date: Date, shifts: Shift[]} | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('shift_app_data', JSON.stringify(shifts));
  }, [shifts]);

  // Calendar Logic
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Determine start and end of month
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    // Calculate start date (Monday based)
    // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const startDay = monthStart.getDay(); 
    // If Sunday(0), back 6 days. If Monday(1), back 0 days.
    const daysToSubtract = startDay === 0 ? 6 : startDay - 1;
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Calculate end date (Sunday based)
    const endDay = monthEnd.getDay();
    // If Sunday(0), add 0. If Monday(1), add 6.
    const daysToAdd = endDay === 0 ? 0 : 7 - endDay;
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + daysToAdd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Handlers
  const handleAddShift = (newShiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      ...newShiftData,
      id: crypto.randomUUID(),
    };
    setShifts(prev => [...prev, newShift]);
    setIsFormOpen(false);
  };

  const handleDeleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    if (selectedDayShifts) {
        // Update the selected day view if open
        const updated = selectedDayShifts.shifts.filter(s => s.id !== id);
        if (updated.length === 0) {
            setSelectedDayShifts(null);
        } else {
            setSelectedDayShifts({ ...selectedDayShifts, shifts: updated });
        }
    }
  };

  const handleDayClick = (day: Date) => {
    const dayShifts = shifts.filter(s => isSameDay(new Date(s.date), day));
    if (dayShifts.length > 0) {
      setSelectedDayShifts({ date: day, shifts: dayShifts });
    } else {
      setSelectedDateForForm(format(day, 'yyyy-MM-dd'));
      setIsFormOpen(true);
      setSelectedDayShifts(null);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const monthName = format(currentDate, 'MMMM yyyy', { locale: it });
    
    doc.setFontSize(18);
    doc.text(`Report Turni - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`, 14, 22);
    
    const monthShifts = shifts.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
    
    // Sort shifts by date
    monthShifts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const tableData = monthShifts.map(s => {
      let description = s.description || '';
      let timeString = '';

      if (s.customDuration) {
          timeString = `Totale: ${s.customDuration}h`;
      } else {
          timeString = `${s.startTime} - ${s.endTime}`;
          if (s.breakMinutes && s.breakMinutes > 0) {
            description += description ? `\n(Pausa: ${s.breakMinutes} min)` : `(Pausa: ${s.breakMinutes} min)`;
          }
      }
      
      return [
        format(new Date(s.date), 'dd/MM/yyyy'),
        timeString,
        s.type,
        description
      ];
    });

    autoTable(doc, {
      head: [['Data', 'Orario / Ore', 'Tipo', 'Note']],
      body: tableData,
      startY: 30,
    });

    const fileName = `Turni_${format(currentDate, 'yyyy_MM')}.pdf`;
    doc.save(fileName);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  // Use addMonths with negative value instead of missing subMonths
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));

  // Render Helpers
  const renderDayCell = (day: Date) => {
    const dayShifts = shifts.filter(s => isSameDay(new Date(s.date), day));
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isTodayDate = isToday(day);
    const holidayName = getHoliday(day);

    return (
      <div 
        key={day.toISOString()}
        onClick={() => handleDayClick(day)}
        className={`
          relative min-h-[85px] p-1 border-r border-b border-gray-100 transition-colors cursor-pointer flex flex-col justify-between
          ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : 'bg-white text-gray-700 hover:bg-gray-50'}
        `}
      >
        <div className="flex justify-between items-start">
          <span className={`
            text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
            ${isTodayDate ? 'bg-blue-600 text-white shadow-md' : holidayName ? 'text-red-600 font-bold' : ''}
          `}>
            {format(day, 'd')}
          </span>
          <div className="flex flex-wrap content-start gap-1 max-w-[60%] justify-end">
             {dayShifts.slice(0, 3).map(shift => (
                <div 
                  key={shift.id} 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: SHIFT_DOT_COLORS[shift.type] }} 
                />
              ))}
              {dayShifts.length > 3 && <span className="text-[8px] leading-none text-gray-400">+</span>}
          </div>
        </div>

        {holidayName && (
             <div className="text-[9px] leading-tight text-red-500 font-medium truncate w-full text-center mt-1">
                {holidayName}
             </div>
        )}
      </div>
    );
  };

  const currentHoliday = selectedDayShifts ? getHoliday(selectedDayShifts.date) : null;

  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 flex flex-col relative shadow-2xl overflow-hidden">
      
      {/* Header */}
      <header className="bg-white px-4 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
          </h1>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">I Miei Turni</p>
        </div>
        <div className="flex gap-1">
             <button onClick={handleExportPDF} className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition" title="Esporta PDF">
                <Download size={20} />
             </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center"></div>
            <button onClick={prevMonth} className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition"><ChevronRight size={20} /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {/* Toggle View */}
        <div className="p-4 flex gap-2 justify-center">
            <div className="bg-gray-200 p-1 rounded-xl flex w-full max-w-[200px]">
                <button 
                    onClick={() => setView('calendar')}
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition ${view === 'calendar' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                >
                    <CalendarIcon size={16} className="mr-2"/> Calendario
                </button>
                <button 
                    onClick={() => setView('stats')}
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition ${view === 'stats' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                >
                    <PieChart size={16} className="mr-2"/> Statistiche
                </button>
            </div>
        </div>

        {view === 'calendar' ? (
            <div className="bg-white mx-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                    {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
                        <div key={i} className={`py-2 text-center text-xs font-bold ${i === 6 ? 'text-red-400' : 'text-gray-400'}`}>
                            {d}
                        </div>
                    ))}
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 auto-rows-fr">
                    {calendarDays.map(renderDayCell)}
                </div>
            </div>
        ) : (
            <div className="px-4">
                <StatsView shifts={shifts} currentMonth={currentDate} />
            </div>
        )}

        {/* Selected Day Details List (Visible below calendar) */}
        {view === 'calendar' && selectedDayShifts && (
            <div className="mt-4 mx-4 bg-white rounded-xl shadow-sm p-4 animate-slide-up pb-24">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 capitalize">{format(selectedDayShifts.date, 'EEEE, d MMMM', { locale: it })}</h3>
                        {currentHoliday && (
                            <span className="text-xs font-bold text-red-500 uppercase tracking-wide">{currentHoliday}</span>
                        )}
                    </div>
                    <button 
                      onClick={() => setSelectedDayShifts(null)}
                      className="text-xs text-blue-600 font-medium"
                    >
                        Chiudi
                    </button>
                </div>
                <div className="space-y-3">
                    {selectedDayShifts.shifts.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Nessun turno inserito.</p>
                    ) : (
                        selectedDayShifts.shifts.map(shift => (
                            <div key={shift.id} className={`p-3 rounded-lg border flex justify-between items-start ${SHIFT_COLORS[shift.type]}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm">{shift.type}</span>
                                        <span className="text-xs opacity-75">• {shift.customDuration ? `${shift.customDuration} ore` : `${shift.startTime} - ${shift.endTime}`}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        {shift.description && (
                                            <p className="text-xs opacity-90">{shift.description}</p>
                                        )}
                                        {shift.breakMinutes && shift.breakMinutes > 0 && !shift.customDuration ? (
                                             <p className="text-xs font-medium opacity-75">
                                                Pausa: {shift.breakMinutes} min
                                             </p>
                                        ) : null}
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteShift(shift.id);
                                    }}
                                    className="p-1.5 bg-white/50 rounded-md hover:bg-white/80 transition"
                                >
                                    <Trash2 size={14} className="text-red-500"/>
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <button 
                    onClick={() => {
                        setSelectedDateForForm(format(selectedDayShifts.date, 'yyyy-MM-dd'));
                        setIsFormOpen(true);
                    }}
                    className="mt-3 w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-700 transition flex items-center justify-center gap-2"
                >
                    <Plus size={16}/> Aggiungi turno
                </button>
            </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => {
            setSelectedDateForForm(format(new Date(), 'yyyy-MM-dd'));
            setIsFormOpen(true);
        }}
        className="absolute bottom-6 right-6 bg-blue-600 text-white p-4 rounded-2xl shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-20 group"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Modal Form */}
      <ShiftForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleAddShift}
        initialDate={selectedDateForForm}
      />

    </div>
  );
}