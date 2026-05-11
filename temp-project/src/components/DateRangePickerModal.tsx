import { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import Card from './Card';
import {
  getMonthName,
  getWeekdayName,
  formatDate,
  parseDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  isDateInRange,
  isToday,
  getDaysDifference,
  addDays,
  getQuickRanges,
  getDateRangeFromQuick,
} from '../utils/dateUtils';
import { getDatesWithData } from '../services/bikeApi';

interface DateRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
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
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<'start' | 'end' | null>(null);
  
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  
  const [datesWithData, setDatesWithData] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const quickRanges = getQuickRanges();

  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStart || null);
      setEndDate(initialEnd || null);
      setTempStartDate(null);
      setSelecting(null);
      setError(null);
      loadDatesWithData(currentYear, currentMonth);
    }
  }, [isOpen, initialStart, initialEnd, currentYear, currentMonth]);

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
      loadDatesWithData(currentYear - 1, 11);
    } else {
      setCurrentMonth(currentMonth - 1);
      loadDatesWithData(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
      loadDatesWithData(currentYear + 1, 0);
    } else {
      setCurrentMonth(currentMonth + 1);
      loadDatesWithData(currentYear, currentMonth + 1);
    }
  };

  const handleQuickSelect = (days: number) => {
    const { start, end } = getDateRangeFromQuick(days);
    setStartDate(start);
    setEndDate(end);
    setTempStartDate(null);
    setSelecting(null);
    setError(null);
  };

  const handleDateClick = (date: Date) => {
    if (date > today) {
      setError('不能选择未来日期');
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setTempStartDate(date);
      setSelecting('end');
      setError(null);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        const daysDiff = getDaysDifference(startDate, date);
        if (daysDiff > MAX_DATE_RANGE_DAYS) {
          setError(`时间范围不能超过 ${MAX_DATE_RANGE_DAYS} 天（约3个月）`);
          return;
        }
        setEndDate(date);
      }
      setTempStartDate(null);
      setSelecting(null);
      setError(null);
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const daysDiff = getDaysDifference(startDate, endDate);
      if (daysDiff > MAX_DATE_RANGE_DAYS) {
        setError(`时间范围不能超过 ${MAX_DATE_RANGE_DAYS} 天（约3个月）`);
        return;
      }
      onApply(startDate, endDate);
      onClose();
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
      if (tempStartDate && selecting === 'end') {
        return date >= tempStartDate;
      }
      return false;
    };

    return (
      <div className="mt-4">
        {/* Weekday headers */}
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

        {/* Calendar days */}
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

              return (
                <button
                  key={dayIndex}
                  onClick={() => !isFuture && handleDateClick(date)}
                  disabled={isFuture}
                  className={`h-10 w-10 mx-auto flex items-center justify-center rounded-lg text-sm transition-all relative ${
                    isFuture
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : isSelectedStart || isSelectedEnd
                      ? 'bg-primary-500 text-white font-semibold hover:bg-primary-600'
                      : isInRange
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : isCurrentDay
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {date.getDate()}
                  {hasData && !isFuture && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        isSelectedStart || isSelectedEnd
                          ? 'bg-white'
                          : 'bg-secondary-500'
                      }`}
                    />
                  )}
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                选择时间范围
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                选择要查看数据的时间段
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex h-[500px]">
          {/* Left sidebar - Quick selects */}
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

            {/* Legend */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                图例
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary-500" />
                  <span className="text-gray-600 dark:text-gray-400">有数据</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary-500" />
                  <span className="text-gray-600 dark:text-gray-400">已选择</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="text-gray-600 dark:text-gray-400">今天</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Calendar */}
          <div className="flex-1 p-6 flex flex-col">
            {/* Date range input */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  开始日期
                </label>
                <input
                  type="text"
                  readOnly
                  value={startDate ? formatDate(startDate) : '选择开始日期'}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div className="text-gray-400 pt-5">—</div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  结束日期
                </label>
                <input
                  type="text"
                  readOnly
                  value={endDate ? formatDate(endDate) : '选择结束日期'}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Calendar Navigation */}
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
                    loadDatesWithData(today.getFullYear(), today.getMonth());
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

            {/* Calendar */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                </div>
              ) : (
                renderCalendar()
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {startDate && endDate ? (
              <span>
                已选择: {formatDate(startDate)} — {formatDate(endDate)}
                <span className="ml-2">
                  ({getDaysDifference(startDate, endDate) + 1} 天)
                </span>
              </span>
            ) : (
              <span>请选择时间范围</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              disabled={!startDate || !endDate}
              className={`px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                startDate && endDate
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              应用
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
