/**
 * Форматирование номера карты (добавление пробелов каждые 4 цифры)
 */
export const formatCardNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length > 16) {
    return numbers.slice(0, 16);
  }
  
  // Группируем по 4 цифры
  const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers;
  return formatted;
};

/**
 * Форматирование срока действия (MM/YY)
 */
export const formatExpiry = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length > 4) {
    return numbers.slice(0, 4);
  }
  
  if (numbers.length >= 2) {
    const month = numbers.slice(0, 2);
    const year = numbers.slice(2, 4);
    
    // Проверка месяца (01-12)
    const monthNum = parseInt(month, 10);
    if (monthNum < 1 || monthNum > 12) {
      return numbers.slice(0, 1) + '/' + numbers.slice(1, 3);
    }
    
    return month + (year ? '/' + year : '');
  }
  
  return numbers;
};

/**
 * Валидация номера карты (должно быть 16 цифр)
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const numbers = cardNumber.replace(/\D/g, '');
  return numbers.length === 16;
};

/**
 * Валидация срока действия (MM/YY)
 */
export const validateExpiry = (expiry: string): boolean => {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  
  if (month < 1 || month > 12) return false;
  
  // Проверяем, что срок не истек
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
};

/**
 * Валидация CVV (3 цифры)
 */
export const validateCvv = (cvv: string): boolean => {
  const numbers = cvv.replace(/\D/g, '');
  return numbers.length === 3;
};
