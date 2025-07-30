import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const FormDatePickerHybrid = ({ 
  value, 
  onChange, 
  placeholder = "DD/MM/AAAA",
  label,
  error,
  disabled = false,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [inputError, setInputError] = useState('');
  
  const inputRef = useRef(null);
  const calendarRef = useRef(null);

  // Inicializar com valor prop
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setInputValue(formatDateToInput(date));
        setCurrentMonth(date);
      }
    }
  }, [value]);

  // Formatar data para input (DD/MM/AAAA)
  const formatDateToInput = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Aplicar máscara durante digitação
  const applyMask = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara progressiva
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
    
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  // Validar data
  const validateDate = (dateString) => {
    if (dateString.length !== 10) return false;
    
    const [day, month, year] = dateString.split('/').map(Number);
    
    if (!day || !month || !year) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  // Converter string DD/MM/AAAA para Date
  const parseInputDate = (dateString) => {
    if (dateString.length !== 10) return null;
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const masked = applyMask(e.target.value);
    setInputValue(masked);
    
    if (masked.length === 10) {
      if (validateDate(masked)) {
        const date = parseInputDate(masked);
        setSelectedDate(date);
        setCurrentMonth(date);
        setInputError('');
        onChange?.(date.toISOString().split('T')[0]);
      } else {
        setInputError('Data inválida');
        setSelectedDate(null);
      }
    } else {
      setInputError('');
      setSelectedDate(null);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'F4' || e.key === 'Enter') {
      e.preventDefault();
      setIsCalendarOpen(!isCalendarOpen);
    } else if (e.key === 'Escape') {
      setIsCalendarOpen(false);
    }
  };

  // Gerar dias do calendário
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Handle calendar date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setInputValue(formatDateToInput(date));
    setInputError('');
    setIsCalendarOpen(false);
    onChange?.(date.toISOString().split('T')[0]);
    inputRef.current?.focus();
  };

  // Navegação do calendário
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isCalendarOpen]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10 border rounded-md shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${(error || inputError) ? 'border-red-500' : 'border-gray-300'}
            ${isCalendarOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
          autoComplete="off"
        />
        
        <button
          type="button"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          disabled={disabled}
          className={`
            absolute right-2 top-1/2 transform -translate-y-1/2
            p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isCalendarOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}
          `}
        >
          <Calendar size={16} />
        </button>
      </div>

      {(error || inputError) && (
        <p className="text-red-500 text-xs mt-1">
          {error || inputError}
        </p>
      )}

      {isCalendarOpen && (
        <div 
          ref={calendarRef}
          className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
        >
          {/* Header do calendário */}
          <div className="flex items-center justify-between p-3 border-b">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            
            <h3 className="font-medium text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 border-b">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7">
            {generateCalendarDays().map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = selectedDate && 
                date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  className={`
                    p-2 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                    ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${isToday && !isSelected ? 'bg-blue-50 text-blue-600 font-medium' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer com botões */}
          <div className="flex justify-between items-center p-3 border-t bg-gray-50">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                handleDateClick(today);
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Hoje
            </button>
            
            <button
              type="button"
              onClick={() => setIsCalendarOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormDatePickerHybrid;