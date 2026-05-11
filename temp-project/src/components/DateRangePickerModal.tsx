import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Card from './Card';
import {
  getMonthName,
  formatDate,
  parseDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  isDateInRange,
  isToday,
  getDaysDifference,
  getQuickRanges,
  getDateRangeFromQuick,
} from '../utils/dateUtils';
import { getDatesWithData } from '../services/bikeApi';

interface DateRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date, selectionType: 'quick' | 'custom') => void;
  initialStart?: Date;
  initialEnd?: Date;
  bikeId?: string;
}

const MAX_DATE_RANGE_DAYS = 90;

export default function DateRangePickerModal({
  isOpen,
  onClose,
  onApply,
  initialStart,
  initialEnd,
  bikeId = 'bike-001',
}: DateRangePickerModalProps) {
  const today = new Date();
  
  const [startDate, setStartDate] = useState<Date | null>(initialStart || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEnd || null);
  const [selecting, setSelecting] = useState<'start' | 'end' | null>(null);
  
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  
  const [datesWithData, setDatesWithData] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startInput, setStartInput] = useState<string>('');
  const [endInput, setEndInput] = useState<string>('');

  const quickRanges = getQuickRanges();

  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStart || null);
      setEndDate(initialEnd || null);
      setStartInput(initialStart ? formatDate(initialStart) : '');
      setEndInput(initialEnd ? formatDate(initialEnd) : '');
      setSelecting(null);
      setError(null);
      loadDatesWithData(currentYear, currentMonth);
    }
  }, [isOpen, initialStart, initialEnd]);

  useEffect(() => {
    if (isOpen) {
      loadDatesWithData(currentYear, currentMonth);
    }
  }, [currentYear, currentMonth, isOpen]);

  const loadDatesWithData = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    try {
      const dates = await getDatesWithData(bikeId, year, month);
      setDatesWithData(dates);
    } catch (err) {
      console.error('Failed to load dates with data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [bikeId]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleQuickSelect = (days: number) => {
    const { start, end } = getDateRangeFromQuick(days);
    setStartDate(start);
    setEndDate(end);
    setStartInput(formatDate(start));
    setEndInput(formatDate(end));
    setSelecting(null);
    setError(null);
    
    onApply(start, end, 'quick');
    onClose();
  };

  const validateAndApplyRange = (start: Date, end: Date) => {
    if (end > today) {
      setError('不能选择未来日期');
      return false;
    }
    
    if (end < start) {
      setError('结束日期不能早于开始日期');
      return false;
    }
    
    const daysDiff = getDaysDifference(start, end);
    if (daysDiff > MAX_DATE_RANGE_DAYS) {
      setError(`时间范围不能超过 ${MAX_DATE_RANGE_DAYS} 天（约3个月）`);
      return false;
    }
    
    return true;
  };

  const handleDateClick = (date: Date) => {
    if (date > today) {
      setError('不能选择未来日期');
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setStartInput(formatDate(date));
      setEndInput('');
      setSelecting('end');
      setError(null);
    } else if (startDate && !endDate) {
      let newStart = startDate;
      let newEnd = date;
      
      if (date < startDate) {
        newStart = date;
        newEnd = startDate;
      }
      
      if (validateAndApplyRange(newStart, newEnd)) {
        setStartDate(newStart);
        setEndDate(newEnd);
        setStartInput(formatDate(newStart));
        setEndInput(formatDate(newEnd));
        setSelecting(null);
        setError(null);
        
        onApply(newStart, newEnd, 'custom');
        onClose();
      }
    }
  };

  const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartInput(value);
    setError(null);
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const date = parseDate(value);
      if (!isNaN(date.getTime())) {
        setStartDate(date);
        setEndDate(null);
        setSelecting('end');
        
        if (endDate && validateAndApplyRange(date, endDate)) {
          onApply(date, endDate, 'custom');
          onClose();
        }
      }
    }
  };

  const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndInput(value);
    setError(null);
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(value) && startDate) {
      const date = parseDate(value);
      if (!isNaN(date.getTime()) && validateAndApplyRange(startDate, date)) {
        setEndDate(date);
        onApply(startDate, date, 'custom');
        onClose();
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const isDateWithData = (date: Date) => {
      return datesWithData.includes(formatDate(date));
    };

    const isDateInSelectionRange = (date: Date) => {
      if (startDate && endDate) {
        return isDateInRange(date, startDate, endDate);
      }
      return false;
    };

    return (
      <div className="mt-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => {
              if (!date) {
                return <div key={dayIndex} className="h-10" />;
              }

              const isSelectedStart = startDate && isSameDay(date, startDate);
              const isSelectedEnd = endDate && isSameDay(date, endDate);
              const isInRange = isDateInSelectionRange(date);
              const isCurrentDay = isToday(date);
              const hasData = isDateWithData(date);
              const isFuture = date > today;
              const isSelectingEnd = selecting === 'end' && startDate && date >= startDate;

              return (
                <button
                  key={dayIndex}
                  onClick={() => !isFuture && handleDateClick(date)}
                  disabled={isFuture}
                  className={`h-10 w-10 mx-auto flex items-center justify-center rounded-lg text-sm transition-all ${
                    isFuture
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : isSelectedStart || isSelectedEnd
                      ? 'bg-primary-500 text-white font-bold hover:bg-primary-600'
                      : isSelectingEnd
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-100 dark:hover:bg-primary-900/30'
                      : isInRange
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                      : hasData
                      ? 'text-primary-600 dark:text-primary-400 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      : isCurrentDay
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative w-full max-w-3xl mx-4 overflow-hidden">
        <div className="flex h-[500px]">
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              快捷选择
            </h3>
            <div className="space-y-1">
              {quickRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleQuickSelect(range.days)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                    startDate &&
                    endDate &&
                    getDaysDifference(startDate, endDate) === range.days - 1
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  开始日期
                </label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={startInput}
                  onChange={handleStartInputChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
                />
              </div>
              <div className="text-gray-400 pt-5">—</div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  结束日期
                </label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={endInput}
                  onChange={handleEndInputChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentYear}年 {getMonthName(currentMonth)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    setCurrentYear(today.getFullYear());
                    setCurrentMonth(today.getMonth());
                  }}
                  className="px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                >
                  今天
                </button>
                <button
                  onClick={handleNextMonth}
                  disabled={currentYear === today.getFullYear() && currentMonth === today.getMonth()}
                  className={`p-2 rounded-xl transition-colors ${
                    currentYear === today.getFullYear() && currentMonth === today.getMonth()
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                </div>
              ) : (
                renderCalendar()
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
