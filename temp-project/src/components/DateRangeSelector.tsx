import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import DateRangePickerModal from './DateRangePickerModal';
import { formatDate, addDays, getDateRangeFromQuick } from '../utils/dateUtils';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
  bikeId?: string;
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onDateRangeChange,
  bikeId = 'bike-001',
}: DateRangeSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDefaultRange = () => {
    const today = new Date();
    return getDateRangeFromQuick(7, today);
  };

  const formatDisplayDate = () => {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (daysDiff === 1) {
      return formatDate(startDate);
    }
    
    return `${formatDate(startDate)} — ${formatDate(endDate)}`;
  };

  const getRangeLabel = () => {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (daysDiff === 1) return '今天';
    if (daysDiff === 7) return '最近一周';
    if (daysDiff === 14) return '最近两周';
    if (daysDiff === 30) return '最近一月';
    return '自定义';
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-colors group"
      >
        <Calendar className="w-4 h-4 text-primary-500" />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDisplayDate()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getRangeLabel()}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
      </button>

      <DateRangePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={onDateRangeChange}
        initialStart={startDate}
        initialEnd={endDate}
        bikeId={bikeId}
      />
    </>
  );
}
