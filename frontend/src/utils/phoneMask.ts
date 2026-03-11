/**
 * Форматирование телефона в формат +7 (___) ___-__-__
 */
export const formatPhoneNumber = (value: string): string => {
  // Удаляем все нецифровые символы
  const numbers = value.replace(/\D/g, '');
  
  // Если номер начинается с 7, оставляем его, иначе добавляем 7
  let phone = numbers.startsWith('7') ? numbers : numbers.length > 0 ? '7' + numbers : '';
  
  // Ограничиваем до 11 цифр (7 + 10 цифр)
  if (phone.length > 11) {
    phone = phone.slice(0, 11);
  }
  
  // Форматируем в +7 (___) ___-__-__
  if (phone.length === 0) {
    return '';
  }
  
  if (phone.length <= 1) {
    return '+7';
  }
  
  const digits = phone.slice(1); // Все цифры кроме первой 7
  
  if (digits.length <= 3) {
    return `+7 (${digits}`;
  }
  
  if (digits.length <= 6) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  
  if (digits.length <= 8) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
};

/**
 * Извлечь только цифры из номера телефона для отправки на сервер (формат +7XXXXXXXXXX)
 */
export const getPhoneDigits = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 0) {
    return '';
  }
  
  // Если номер начинается с 7, добавляем +
  if (numbers.startsWith('7')) {
    return '+' + numbers;
  }
  
  // Иначе добавляем +7
  return '+7' + numbers;
};
