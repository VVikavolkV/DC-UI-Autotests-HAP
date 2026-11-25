import { test, expect } from '@playwright/test';
import { config } from './config.js';

// --- БЛОК 1: Обновление токенов (POST /api/auth/token/refresh/) ---
test.describe('API: /api/auth/token/refresh/ - Валидация', () => {

  // ВСТАВЛЯЕМ ТЕСТ-КЕЙС: TC_018 (Тело запроса без поля refresh)
  test('TC_018: Тело запроса без поля refresh', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      data: {}, // Отправляем пустой JSON (из шагов тест-кейса)
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Authorization': `Bearer ${config.platformToken}` 
      }
    });

    const body = await response.json();
    
    // ВАЖНО: Если тест падает на этой строке, значит проблема с Platform-токеном в config.js.
    // Сервер должен вернуть именно 400, когда токен валиден.
    expect(response.status()).toBe(400);
    
    // БЕРЕМ ИЗ SWAGGER: Для пустого тела сервер возвращает именно эти значения.
    expect(body.error).toBe('BAD_REQUEST');
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  // ВСТАВЛЯЕМ ТЕСТ-КЕЙС: TC_024 (Невалидный refresh-токен)
  test('TC_024: Невалидный refresh-токен', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      data: { refresh: 'invalid.token.value' }, // Из шагов тест-кейса
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Authorization': `Bearer ${config.platformToken}`
      }
    });

    const body = await response.json();

    // ОЖИДАЕМЫЙ РЕЗУЛЬТАТ ИЗ ТЕСТ-КЕЙСА: 401 Unauthorized
    expect(response.status()).toBe(401);
    
    // БЕРЕМ ИЗ SWAGGER (пример ответа 401): 
    expect(body.error).toBe('UNAUTHORIZED');
    expect(body.code).toBe('INVALID_TOKEN');
  });
});

// --- БЛОК 2: Запрос OTP (POST /api/auth/otp/request/) ---
test.describe('API: /api/auth/otp/request/ - Валидация', () => {

  // ВСТАВЛЯЕМ ТЕСТ-КЕЙС: TC_040 (Email без символа @)
  test('TC_040: Email без символа @', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/otp/request/`, {
      data: { 
        email: 'studentexample.com', // Из шагов тест-кейса (без @)
        turnstile_token: 'dummy_token' // Заглушка, так как до капчи дело не дойдет
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Authorization': `Bearer ${config.platformToken}`
      }
    });

    const body = await response.json();
    
    // ОЖИДАЕМЫЙ РЕЗУЛЬТАТ ИЗ ТЕСТ-КЕЙСА: 400
    expect(response.status()).toBe(400);
    
    // БЕРЕМ ИЗ SWAGGER (пример ответа 400 для otp/request):
    expect(body.error).toBe('BAD_REQUEST');
    expect(body.code).toBe('INVALID_EMAIL'); 
  });

  // ВСТАВЛЯЕМ ТЕСТ-КЕЙС: TC_045 (Отсутствует turnstile_token)
  test('TC_045: Отсутствует turnstile_token', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/otp/request/`, {
      data: { 
        email: 'test@example.com' // Передаем только email, без токена капчи
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Authorization': `Bearer ${config.platformToken}`
      }
    });

    const body = await response.json();
    
    // ОЖИДАЕМЫЙ РЕЗУЛЬТАТ ИЗ ТЕСТ-КЕЙСА: 400
    expect(response.status()).toBe(400);
    
    // БЕРЕМ ИЗ ТЕСТ-КЕЙСА и SWAGGER: код ошибки MISSING_TOKEN
    expect(body.error).toBe('BAD_REQUEST');
    expect(body.code).toBe('MISSING_TOKEN'); 
  });
});