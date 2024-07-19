import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDate = (date) => {
  const result = date
    ? format(new Date(date), 'dd/MM/yyyy', { locale: vi })
    : '';
  return result;
};

export const formatTime = (date) => {
  const result = date
    ? format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi })
    : '';
  return result;
};

export function formatNumberWithDot(number) {
  return number.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
}

export function formatNumber(number) {
  return number.toLocaleString('vi-VN');
}

export const formatAndPreserveCursor = (e) => {
  const input = e.target;
  const { value } = input;
  const cursorPosition = input.selectionStart;
  const numericValue = value.replace(/\D/g, '');
  const formattedValue = formatNumber(Number(numericValue));

  // Update the input value
  input.value = formattedValue;

  // Restore the cursor position
  const diff = formattedValue.length - numericValue.length;
  input.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
};
