import React, { useState, useEffect } from 'react';
import { Shift, ShiftType } from '../types';
import { SHIFT_COLORS, SHIFT_ICONS } from '../constants';
import { X, Sparkles, Loader2, Save, Coffee, Clock } from 'lucide-react';
import { parseShiftFromText } from '../services/geminiService';
import { format } from 'date-fns';

interface ShiftFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Omit<Shift, 'id'>) => void;
  initialDate?: string;
}

export const ShiftForm: React.FC<ShiftFormProps> = ({ isOpen, onClose, onSave, initialDate }) => {
  const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
  const [mode, setMode] = useState<'time' | 'duration'>('time');
  
  // Time mode state
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  
  // Duration mode state
  const [customDuration, setCustomDuration] = useState<number>(8);

  const [breakMinutes, setBreakMinutes] = useState<number | ''>(0);
  const [type, setType] = useState<ShiftType>(ShiftType.ORDINARY);
  const [description, setDescription] = useState('');
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (initialDate) setDate(initialDate);
  }, [initialDate]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      date,
      startTime: mode === 'time' ? startTime : '',
      endTime: mode === 'time' ? endTime : '',
      type,
      description,
      breakMinutes: Number(breakMinutes) || 0,
      customDuration: mode === 'duration' ? Number(customDuration) : undefined
    });
    // Reset form defaults
    setDescription('');
    setBreakMinutes(0);
    setMode('time');
    setCustomDuration(8);
    onClose();
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    setAiError('');
    
    try {
      const result = await parseShiftFromText(aiPrompt, format(new Date(), 'yyyy-MM-dd'));
      
      if (result) {
        if (result.date) setDate(result.date);
        
        if (result.customDuration) {
            setMode('duration');
            setCustomDuration(result.customDuration);
        } else {
            setMode('time');
            if (result.startTime) setStartTime(result.startTime);
            if (result.endTime) setEndTime(result.endTime);
        }

        if (result.breakMinutes !== undefined) setBreakMinutes(result.breakMinutes);
        if (result.type && Object.values(ShiftType).includes(result.type as ShiftType)) {
            setType(result.type as ShiftType);
        }
        if (result.description) setDescription(result.description);
      } else {
        setAiError("Non ho capito. Prova '8 ore ferie domani' o '9-18 lavoro'");
      }
    } catch (e) {
      setAiError("Servizio AI non disponibile.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 pointer-events-auto transform transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Aggiungi Turno</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* AI Quick Fill Section */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2 text-blue-700 font-medium text-sm">
            <Sparkles size={16} />
            <span>Compilazione Rapida AI</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="es. 8 ore ferie lunedì"
              className="flex-1 text-sm p-2 text-gray-900 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            <button 
              onClick={handleAiGenerate}
              disabled={isAiLoading || !aiPrompt}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isAiLoading ? <Loader2 className="animate-spin" size={20}/> : 'Vai'}
            </button>
          </div>
          {aiError && <p className="text-xs text-red-500 mt-2">{aiError}</p>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ colorScheme: 'light' }}
              className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-1 bg-gray-100 rounded-lg mb-2">
             <button 
                onClick={() => setMode('time')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'time' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
             >
                Orario (es. 9-17)
             </button>
             <button 
                onClick={() => setMode('duration')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'duration' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
             >
                Ore Totali (es. 8h)
             </button>
          </div>

          {mode === 'time' ? (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inizio</label>
                  <input 
                    type="time" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fine</label>
                  <input 
                    type="time" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
          ) : (
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Clock size={14} className="text-gray-500"/>
                    Ore totali da calcolare
                  </label>
                  <input 
                    type="number"
                    step="0.5" 
                    value={customDuration} 
                    onChange={(e) => setCustomDuration(parseFloat(e.target.value))}
                    style={{ colorScheme: 'light' }}
                    className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
              </div>
          )}

          {mode === 'time' && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Coffee size={14} className="text-gray-500"/>
                    Pausa (minuti)
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={breakMinutes} 
                  onChange={(e) => setBreakMinutes(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="0"
                  style={{ colorScheme: 'light' }}
                  className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Turno</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {Object.values(ShiftType).map((t) => {
                 const Icon = SHIFT_ICONS[t];
                 return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                      type === t 
                        ? SHIFT_COLORS[t] + ' ring-2 ring-offset-1 ring-gray-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione (Opzionale)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Note, luogo, ecc."
              rows={2}
              className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <Save size={20} />
          Salva Turno
        </button>
      </div>
    </div>
  );
};