import { test, expect } from '@playwright/test';
import { config } from './config.js';

// Общие заголовки для всех запросов
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Platform-Authorization': `Bearer ${config.platformToken}`
});

// =====================================================================
// БЛОК 1: ОБНОВЛЕНИЕ ТОКЕНОВ (POST /api/auth/token/refresh/)
// =====================================================================
test.describe('API: /api/auth/token/refresh/ - Обновление токенов', () => {

  // ТЕСТ-КЕЙС: TC_019 (Запрос без тела)
  test('TC_019: Запрос без тела', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.error).toBe('BAD_REQUEST');
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  // ТЕСТ-КЕЙС: TC_020 (Некорректный JSON в теле)
  test('TC_020: Некорректный JSON в теле', async ({ request }) => {
    // Отправляем битый JSON (строка вместо объекта)
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      data: '{"refresh": ', // Невалидный JSON
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  // ТЕСТ-КЕЙС: TC_021 (Пустая строка в refresh)
  test('TC_021: Пустая строка в refresh', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      data: { refresh: '' }, 
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  // ТЕСТ-КЕЙС: TC_022 (refresh = null)
  test('TC_022: refresh = null', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      data: { refresh: null }, 
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  // ТЕСТ-КЕЙС: TC_023 (refresh неверного типа (число))
  test('TC_023: refresh неверного типа (число)', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      data: { refresh: 12345 }, 
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  // ТЕСТ-КЕЙС: TC_027 (Access-токен вместо refresh)
  test('TC_027: Access-токен вместо refresh', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      data: { refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_access' }, 
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(401);
    expect(body.code).toBe('INVALID_TOKEN');
  });
});

// =====================================================================
// БЛОК 2: ЗАВЕРШЕНИЕ СЕССИИ (POST /api/auth/logout/)
// =====================================================================
test.describe('API: /api/auth/logout/ - Выход из системы', () => {

  // ТЕСТ-КЕЙС: TC_002 (Отсутствует заголовок X-AUTH-TOKEN)
  test('TC_002: Отсутствует заголовок X-AUTH-TOKEN', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/logout/`, {
      headers: {
        ...getHeaders(),
        'X-REFRESH-TOKEN': 'dummy_refresh_token' // Передаем только refresh
      }
    });
    const body = await response.json();
    
    expect(response.status()).toBe(401);
    expect(body.error).toBe('UNAUTHORIZED');
    expect(body.code).toBe('MISSING_X_AUTH_TOKEN');
  });

  // ТЕСТ-КЕЙС: TC_003 (Отсутствует заголовок X-REFRESH-TOKEN)
  test('TC_003: Отсутствует заголовок X-REFRESH-TOKEN', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/logout/`, {
      headers: {
        ...getHeaders(),
        'X-AUTH-TOKEN': 'dummy_access_token' // Передаем только access
      }
    });
    const body = await response.json();
    
    expect(response.status()).toBe(401);
    expect(body.code).toBe('MISSING_X_REFRESH_TOKEN');
  });

  // ⚠️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА: Для остальных тестов (TC_001, TC_004, TC_006 и т.д.) 
  // нужны РЕАЛЬНЫЕ X-AUTH-TOKEN и X-REFRESH-TOKEN, чтобы проверить успешный logout или невалидные токены.
  test.skip('TC_001: Успешное завершение JWT-сессии', async ({ request }) => {
    // TODO: Когда разраб даст реальные токены, раскомментировать код ниже
    /*
    const response = await request.post(`${config.baseUrl}/api/auth/logout/`, {
      headers: {
        ...getHeaders(),
        'X-AUTH-TOKEN': 'ВСТАВИТЬ_РЕАЛЬНЫЙ_ACCESS',
        'X-REFRESH-TOKEN': 'ВСТАВИТЬ_РЕАЛЬНЫЙ_REFRESH'
      }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({});
    */
  });
});

// =====================================================================
// БЛОК 3: ЗАПРОС OTP (POST /api/auth/otp/request/)
// =====================================================================
test.describe('API: /api/auth/otp/request/ - Запрос OTP кода', () => {

  // Массив с тестовыми данными для проверки email
  const invalidEmails = [
    { id: 'TC_041', email: 'student@', desc: 'Email без домена' },
    { id: 'TC_042', email: '', desc: 'Пустая строка в email' },
    { id: 'TC_043', email: undefined, desc: 'Отсутствует поле email' },
    { id: 'TC_044', email: null, desc: 'Email = null' },
    { id: 'TC_044_1', email: 12345, desc: 'Email = число' }
  ];

  // Автоматически генерируем тесты для всех невалидных email
  for (const data of invalidEmails) {
    test(`${data.id}: ${data.desc}`, async ({ request }) => {
      const payload = { turnstile_token: 'dummy' };
      if (data.email !== undefined) payload.email = data.email;

      const response = await request.post(`${config.baseUrl}/api/auth/otp/request/`, {
        data: payload,
        headers: getHeaders()
      });
      const body = await response.json();
      
      expect(response.status()).toBe(400);
      // В Swagger указано BAD_REQUEST для этих ошибок
      expect(body.error).toBe('BAD_REQUEST'); 
      expect(body.code).toBe('INVALID_EMAIL'); 
    });
  }

  // ТЕСТ-КЕЙС: TC_046 (Пустая строка в turnstile_token)
  test('TC_046: Пустая строка в turnstile_token', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/otp/request/`, {
      data: { email: 'test@example.com', turnstile_token: '' },
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.code).toBe('INVALID_TOKEN');
  });

  // ТЕСТ-КЕЙС: TC_048 (Невалидный turnstile_token)
  test('TC_048: Невалидный turnstile_token', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/otp/request/`, {
      data: { email: 'test@example.com', turnstile_token: 'invalid-token' },
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.code).toBe('INVALID_TOKEN');
  });

  // ТЕСТ-КЕЙС: TC_050 (Лишнее поле в теле запроса)
  test('TC_050: Лишнее поле в теле запроса', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/otp/request/`, {
      data: { email: 'test@example.com', turnstile_token: 'dummy', extra: 'x' },
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR'); // Строгая валидация схемы
  });

  // ⚠️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА: Позитивный тест TC_037, TC_039 и TC_054 (без токена) 
  // Требует РЕАЛЬНЫЙ turnstile_token или тестовый ключ, который пропускает капчу.
  test.skip('TC_037: Успешный запрос OTP-кода', async ({ request }) => {
    // TODO: Когда разраб даст тестовый ключ капчи, написать код здесь
    // Ожидаем 200 OK и поля: message, expires_in, resend_after, attempts_remaining
  });
});

// =====================================================================
// БЛОК 4: ПРОВЕРКА OTP (POST /api/auth/otp/verify/)
// =====================================================================
test.describe('API: /api/auth/otp/verify/ - Проверка OTP', () => {

  // Набор тестов на невалидный формат code
  const invalidCodes = [
    { id: 'TC_070', code: '12345', desc: 'code из 5 цифр' },
    { id: 'TC_071', code: '1234567', desc: 'code из 7 цифр' },
    { id: 'TC_072', code: '12ab56', desc: 'code с буквами' },
    { id: 'TC_073', code: '', desc: 'Пустая строка в code' },
    { id: 'TC_074', code: undefined, desc: 'Отсутствует поле code' },
    { id: 'TC_075', code: 123456, desc: 'code неверного типа (число)' }
  ];

  for (const data of invalidCodes) {
    test(`${data.id}: ${data.desc}`, async ({ request }) => {
      const payload = { email: 'test@example.com' };
      if (data.code !== undefined) payload.code = data.code;

      const response = await request.post(`${config.baseUrl}/api/auth/otp/verify/`, {
        data: payload,
        headers: getHeaders()
      });
      const body = await response.json();
      
      expect(response.status()).toBe(400);
      expect(body.code).toBe('VALIDATION_ERROR'); 
    });
  }

  // Набор тестов на невалидный email
  const invalidEmailsVerify = [
    { id: 'TC_076', email: 'userexample.com', desc: 'Некорректный формат email (нет @)' },
    { id: 'TC_076_2', email: 'user@', desc: 'Некорректный формат email (нет домена)' },
    { id: 'TC_077', email: '', desc: 'Пустой email' },
    { id: 'TC_077_2', email: null, desc: 'email = null' }
  ];

  for (const data of invalidEmailsVerify) {
    test(`${data.id}: ${data.desc}`, async ({ request }) => {
      const response = await request.post(`${config.baseUrl}/api/auth/otp/verify/`, {
        data: { email: data.email, code: '123456' },
        headers: getHeaders()
      });
      const body = await response.json();
      
      expect(response.status()).toBe(400);
      expect(body.code).toBe('INVALID_EMAIL'); 
    });
  }

  // ТЕСТ-КЕЙС: TC_078 (Лишнее поле в теле)
  test('TC_078: Лишнее поле в теле', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/otp/verify/`, {
      data: { email: 'test@example.com', code: '123456', extra: 'x' },
      headers: getHeaders()
    });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  // ⚠️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА: Тесты с неверным OTP (TC_061, TC_063) 
  // и успешным входом (TC_056, TC_059).
  // Для них нужен реальный email, на который можно отправить код, и доступ к Mailpit.
  test.skip('TC_061: Неверный OTP-код', async ({ request }) => {
    // TODO: Когда разраб даст доступ к почте, написать тест, 
    // где мы сначала запрашиваем OTP, потом вводим неверный код и ждем 400 INVALID_OTP
  });

  test.skip('TC_056: Успешный вход существующего пользователя', async ({ request }) => {
    // TODO: Написать тест, где мы получаем реальный OTP из Mailpit и вводим его. 
    // Ожидаем 200 OK, is_new_user: false, access и refresh.
  });
});

// =====================================================================
// БЛОК 5: ЗАВЕРШЕНИЕ РЕГИСТРАЦИИ (POST /api/auth/registration/complete/)
// =====================================================================
test.describe('API: /api/auth/registration/complete/ - Регистрация', () => {

  // ТЕСТ-КЕЙС: TC_101 (Нет заголовка X-Registration-Token)
  test('TC_101: Нет заголовка X-Registration-Token', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: { agreement: true },
      headers: getHeaders() // Не передаем X-Registration-Token
    });
    const body = await response.json();
    
    expect(response.status()).toBe(401);
    expect(body.error).toBe('UNAUTHORIZED');
    expect(body.code).toBe('MISSING_TOKEN');
  });

  // ТЕСТ-КЕЙС: TC_102 (Пустое значение X-Registration-Token)
  test('TC_102: Пустое значение X-Registration-Token', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: { agreement: true },
      headers: {
        ...getHeaders(),
        'X-Registration-Token': ''
      }
    });
    const body = await response.json();
    
    expect(response.status()).toBe(401);
    expect(body.code).toBe('INVALID_TOKEN');
  });

  // ТЕСТ-КЕЙС: TC_103 (Невалидный registration_token)
  test('TC_103: Невалидный registration_token', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: { agreement: true },
      headers: {
        ...getHeaders(),
        'X-Registration-Token': 'invalid.token.value'
      }
    });
    const body = await response.json();
    
    expect(response.status()).toBe(401);
    expect(body.code).toBe('INVALID_TOKEN');
  });

  // ⚠️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА: Позитивные тесты (TC_090, TC_095, TC_096).
  // Требуют ВАЛИДНЫЙ {{REGISTRATION_TOKEN}}, который выдается только после реального прохождения OTP.
  test.skip('TC_095: Согласие не дано (agreement = false)', async ({ request }) => {
    // TODO: Когда получим рабочий токен, написать тест с agreement: false
    // Ожидаем 400 BAD_REQUEST, code: AGREEMENT_REQUIRED
  });

});