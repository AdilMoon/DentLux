import axios, { AxiosError } from 'axios';

// Переводы ошибок на казахский язык
const errorTranslations: Record<string, string> = {
  // Сетевые ошибки
  'Network Error': 'Интернет байланысы жоқ. Интернет байланысын тексеріңіз.',
  'timeout': 'Серверге жету уақыты аяқталды. Қайта көріңіз.',
  'ERR_NETWORK': 'Интернет байланысы жоқ',

  // HTTP статусы
  '400': 'Жарамсыз сұрау',
  '401': 'Кіру қажет',
  '403': 'Рұқсат жоқ',
  '404': 'Табылмады',
  '409': 'Қайталанатын мәліметтер',
  '429': 'Тым көп сұраулар. Кейінірек көріңіз.',
  '500': 'Сервер қатесі',
  '503': 'Қызмет уақытша қолжетімсіз',

  // Сообщения от сервера
  'Email немесе пароль дұрыс емес': 'Email немесе пароль дұрыс емес',
  'Бұл email бойынша пайдаланушы бар': 'Бұл email бойынша пайдаланушы бар',
  'Пайдаланушы табылмады': 'Пайдаланушы табылмады',
};

/**
 * Получить понятное сообщение об ошибке на казахском языке
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;

    // Проверяем, есть ли сообщение об ошибке в ответе сервера
    if (axiosError.response?.data) {
      const serverError = axiosError.response.data.error || axiosError.response.data.message;
      if (serverError && errorTranslations[serverError]) {
        return errorTranslations[serverError];
      }
      if (serverError) {
        return serverError;
      }
    }

    // Проверяем HTTP статус код
    if (axiosError.response?.status) {
      const statusCode = axiosError.response.status.toString();
      if (errorTranslations[statusCode]) {
        return errorTranslations[statusCode];
      }
    }

    // Проверяем код ошибки axios
    if (axiosError.code && errorTranslations[axiosError.code]) {
      return errorTranslations[axiosError.code];
    }

    // Проверяем сообщение ошибки
    if (axiosError.message && errorTranslations[axiosError.message]) {
      return errorTranslations[axiosError.message];
    }

    // Проверяем, это сетевая ошибка?
    if (!axiosError.response) {
      return 'Интернет байланысы жоқ. Интернет байланысын тексеріңіз.';
    }
  }

  // Если это обычная ошибка
  if (error instanceof Error) {
    return error.message || 'Белгісіз қате орын алды';
  }

  return 'Белгісіз қате орын алды';
};

/**
 * Проверить, доступен ли API
 */
export const isApiAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 секунды таймаут
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Retry механизм для запросов
 */
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Не повторяем для определенных ошибок
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        // Не повторяем для 4xx ошибок (кроме 429)
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw error;
        }
      }

      // Если это последняя попытка, выбрасываем ошибку
      if (attempt === maxRetries) {
        break;
      }

      // Ждем перед следующей попыткой (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};
