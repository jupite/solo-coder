export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
};

export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const time = date.getTime();
  return time >= startDate.getTime() && time <= endDate.getTime();
};

export const getDaysDifference = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
};

export const getDateRange = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const getQuickRanges = (): { label: string; days: number }[] => {
  return [
    { label: '最近一天', days: 1 },
    { label: '最近一周', days: 7 },
    { label: '最近二周', days: 14 },
    { label: '最近一个月', days: 30 },
  ];
};

export const getDateRangeFromQuick = (days: number, today: Date = new Date()): { start: Date; end: Date } => {
  const end = new Date(today);
  const start = addDays(end, -(days - 1));
  return { start, end };
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const getMonthName = (month: number): string => {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return months[month];
};

export const getWeekdayName = (day: number): string => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return weekdays[day];
};
