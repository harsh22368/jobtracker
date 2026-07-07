import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import './CustomDatePicker.css';

const CustomDatePicker = ({ value, onChange, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : new Date());
  const ref = useRef(null);

  const selectedDate = value ? parseISO(value) : null;

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day) => {
    onChange({ target: { name, value: format(day, 'yyyy-MM-dd') } });
    setIsOpen(false);
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(startOfMonth(currentMonth));
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="cal-day-name" key={i}>
          {format(addDays(startDate, i), 'EE')}
        </div>
      );
    }
    return <div className="cal-days-row">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        days.push(
          <div
            className={`cal-cell ${!isCurrentMonth ? 'disabled' : isSelected ? 'selected' : ''}`}
            key={day}
            onClick={() => onDateClick(cloneDay)}
          >
            <span className="cal-date">{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="cal-row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="cal-body">{rows}</div>;
  };

  return (
    <div className="custom-datepicker" ref={ref}>
      <div className="picker-input" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={16} className="text-muted" />
        <span className={value ? 'value' : 'placeholder'}>
          {value ? format(parseISO(value), 'MMM dd, yyyy') : 'Select date'}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="cal-popover"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="cal-header">
              <button type="button" onClick={prevMonth}><ChevronLeft size={18} /></button>
              <div className="cal-month">{format(currentMonth, 'MMMM yyyy')}</div>
              <button type="button" onClick={nextMonth}><ChevronRight size={18} /></button>
            </div>
            {renderDays()}
            {renderCells()}
            <div className="cal-footer">
              <button type="button" className="cal-today-btn" onClick={() => onDateClick(new Date())}>Today</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
