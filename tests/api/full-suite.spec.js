import { test, expect } from '@playwright/test';
import { config } from './config.js';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Platform-Authorization': `Bearer ${config.platformToken}`
});

// =====================================================================
// БЛОК 1: LOGOUT (Завершение JWT-сессии)
// =====================================================================
test.describe('API: /api/auth/logout/', () => {
  const authHeaders = {
    ...getHeaders(),
    'X-AUTH-TOKEN': 'REAL_ACCESS_TOKEN', // TODO: Заменить на реальные токены
    'X-REFRESH-TOKEN': 'REAL_REFRESH_TOKEN'
  };

  // ⏸️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА: Валидные токены.
  test.skip('TC_001: Успешное завершение JWT-сессии', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/logout/`, { headers: authHeaders });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({});
  });

  test.skip('TC_004: Дублирующийся заголовок X-AUTH-TOKEN', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/logout/`, {
      headers: { ...getHeaders(), 'X-AUTH-TOKEN': 'token1, token2', 'X-REFRESH-TOKEN': 'refresh' }
    });
    const body = await response.json();
    expect(response.status()).toBe(401);
    expect(body.code).toBe('INVALID_LOGOUT_HEADERS');
  });

  test.skip('TC_006: Невалидный access-токен', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/logout/`, {
      headers: { ...getHeaders(), 'X-AUTH-TOKEN': 'invalid.token.value', 'X-REFRESH-TOKEN': 'real_refresh' }
    });
    expect(response.status()).toBe(401);
    expect((await response.json()).code).toBe('INVALID_TOKEN');
  });

  test.skip('TC_008: Истекший access-токен', async ({ request }) => {
    // TODO: Нужен токен с истекшим сроком. Можно жестко зашить старый токен в конфиг.
  });
  
  test.skip('TC_011: Access и refresh от разных юзеров', async ({ request }) => {
    // TODO: Нужны два разных аккаунта, чтобы взять токены от разных людей.
  });

  test.skip('TC_012: Внутренняя ошибка сервера (500)', async ({ request }) => {
    // TODO: Требуется сбой БД (DevOps). Мы не можем вызвать 500 просто запросом.
  });
});

// =====================================================================
// БЛОК 2: REFRESH TOKEN (Обновление токенов)
// =====================================================================
test.describe('API: /api/auth/token/refresh/', () => {

  // ✅ ЭТИ ТЕСТЫ МОЖНО ЗАПУСКАТЬ (Валидация)
  test('TC_025: Истекший refresh-токен (проверка структуры)', async ({ request }) => {
    // Мы отправляем фейковый токен, сервер должен сказать, что он невалиден или истек
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      data: { refresh: 'expired.dummy.token' }, headers: getHeaders()
    });
    expect(response.status()).toBe(401);
    expect((await response.json()).code).toBe('INVALID_TOKEN'); // или TOKEN_EXPIRED
  });

  // ⏸️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА: Валидный токен.
  test.skip('TC_013: Успешное обновление пары токенов', async ({ request }) => {
    // TODO: Раскомментировать, когда будет реальный refresh-токен.
    /*
    const response = await request.post(`${config.baseUrl}/api/auth/token/refresh/`, {
      data: { refresh: 'REAL_REFRESH_TOKEN' }, headers: getHeaders()
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('access');
    expect(body).toHaveProperty('refresh');
    */
  });

  test.skip('TC_015: Ротация: старый refresh отозван', async ({ request }) => {
    // TODO: Сначала делаем успешный refresh (TC_013), берем новый, а потом пробуем старый.
    // Ожидаем 401 и код TOKEN_REVOKED.
  });

  test.skip('TC_017: Актуальные данные профиля после изменения', async ({ request }) => {
    // TODO: Требует логина с двух устройств (два токена), смены профиля и проверки payload.
  });
});

// =====================================================================
// БЛОК 3: TURNSTILE (Капча)
// =====================================================================
test.describe('API: /api/auth/turnstile/', () => {

  // ✅ МОЖНО ЗАПУСКАТЬ (Если токен валиден)
  test('TC_029: Успешное получение настроек Turnstile', async ({ request }) => {
    const response = await request.get(`${config.baseUrl}/api/auth/turnstile/`, { headers: getHeaders() });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('provider');
    expect(body).toHaveProperty('site_key');
  });

  test('TC_030: Значение provider', async ({ request }) => {
    const response = await request.get(`${config.baseUrl}/api/auth/turnstile/`, { headers: getHeaders() });
    const body = await response.json();
    expect(body.provider).toBe('cloudflare_turnstile');
  });

  test('TC_033: Запрос без JWT-токенов (только Platform)', async ({ request }) => {
    // Turnstile доступен без X-AUTH-TOKEN (только с Platform)
    const response = await request.get(`${config.baseUrl}/api/auth/turnstile/`, {
      headers: { 'X-Platform-Authorization': `Bearer ${config.platformToken}` }
    });
    expect(response.status()).toBe(200);
  });

  // ⏸️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА
  test.skip('TC_035: Превышен лимит запросов (429)', async ({ request }) => {
    // TODO: Нужно сделать 100 запросов подряд в цикле, чтобы вызвать 429.
    // Или узнать у разраба, какой именно лимит.
  });
});

// =====================================================================
// БЛОК 4: OTP REQUEST (Запрос OTP-кода)
// =====================================================================
test.describe('API: /api/auth/otp/request/', () => {
  
  // ⏸️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА: Тестовый Turnstile токен.
  test.skip('TC_037: Успешный запрос OTP-кода', async ({ request }) => {
    // TODO: Заменить turnstile_token на тестовый (например, '1x00000000000000000000AA').
    /*
    const response = await request.post(`${config.baseUrl}/api/auth/otp/request/`, {
      data: { email: 'test@example.com', turnstile_token: 'TEST_TURNSTILE_TOKEN' },
      headers: getHeaders()
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('OTP-код отправлен на email');
    expect(body.attempts_remaining).toBe(5);
    */
  });

  test.skip('TC_038: OTP-код приходит на почту', async ({ request }) => {
    // TODO: Этот тест будет использовать API Mailpit (о котором мы спросим разраба).
    // Шаг 1: Запросить код. Шаг 2: Сходить в Mailpit. Шаг 3: Проверить, что письмо есть.
  });

  test.skip('TC_039: Email в верхнем регистре', async ({ request }) => {
    // TODO: Отправить 'STUDENT@EXAMPLE.COM', ожидать 200 и проверить, что в ответе email приведен к нижнему регистру.
  });

  // ✅ МОЖНО ЗАПУСКАТЬ
  test('TC_047: Истекший turnstile_token', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/otp/request/`, {
      data: { email: 'test@example.com', turnstile_token: 'EXPIRED_TOKEN' }, headers: getHeaders()
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).code).toBe('EXPIRED_TOKEN');
  });

  test.skip('TC_052: Повторный запрос в пределах cooldown (429)', async ({ request }) => {
    // TODO: Нужно дважды подряд (менее чем через 60 сек) вызвать успешный запрос (TC_037).
    // Второй запрос должен вернуть 429 и details.retry_after.
  });

  test.skip('TC_053: Запрос после окончания cooldown', async ({ request }) => {
    // TODO: Сделать паузу в тесте на 60 секунд (await page.waitForTimeout(60000)), затем повторить.
  });
});

// =====================================================================
// БЛОК 5: OTP VERIFY (Проверка OTP-кода)
// =====================================================================
test.describe('API: /api/auth/otp/verify/', () => {

  // ⏸️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА: Реальный OTP-код из почты.
  test.skip('TC_056: Успешный вход существующего пользователя', async ({ request }) => {
    // TODO: Нужно вытащить OTP из почты, вставить сюда. Ожидаем 200, is_new_user: false и токены.
  });

  test.skip('TC_059: Верификация нового пользователя', async ({ request }) => {
    // TODO: Нужен email, которого нет в базе. Ожидаем is_new_user: true и registration_token.
  });

  test.skip('TC_061: Неверный OTP-код', async ({ request }) => {
    // TODO: Отправить '000000'. Ожидаем 400, INVALID_OTP, attempts_remaining: 4.
  });

  test.skip('TC_062: Уменьшение attempts_remaining', async ({ request }) => {
    // TODO: В цикле отправить 4 неверных кода. Проверить, что счетчик падает 4 -> 3 -> 2 -> 1.
  });

  test.skip('TC_063: Исчерпание попыток', async ({ request }) => {
    // TODO: Отправить 5 неверных кодов. 5-й должен вернуть 429 OTP_ATTEMPTS_EXCEEDED.
  });

  test.skip('TC_065: Истекший OTP-код', async ({ request }) => {
    // TODO: Запросить код, подождать 301 секунду (await new Promise(r => setTimeout(r, 301000))), 
    // затем ввести его. Ожидаем 400 OTP_EXPIRED.
  });
});

// =====================================================================
// БЛОК 6: REGISTRATION COMPLETE (Завершение регистрации)
// =====================================================================
test.describe('API: /api/auth/registration/complete/', () => {
  const regHeaders = {
    ...getHeaders(),
    'X-Registration-Token': 'REAL_REG_TOKEN' // TODO: Заменить на реальный токен
  };

  // ⏸️ ТРЕБУЕТСЯ ОТ РАЗРАБОТЧИКА: Валидный registration_token.
  test.skip('TC_090: Успешное завершение регистрации', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: { agreement: true }, headers: regHeaders
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('access');
    expect(body).toHaveProperty('refresh');
  });

  test.skip('TC_095: Согласие не дано (agreement = false)', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: { agreement: false }, headers: regHeaders
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).code).toBe('AGREEMENT_REQUIRED');
  });

  // ✅ МОЖНО ЗАПУСКАТЬ (Ошибки валидации не требуют валидного токена регистрации, 
  // если токен невалидный, сервер все равно проверит тело запроса)
  
  test('TC_097: Отсутствует поле agreement', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: {}, headers: { ...getHeaders(), 'X-Registration-Token': 'dummy' }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).code).toBe('VALIDATION_ERROR');
  });

  test('TC_098: Agreement неверного типа', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: { agreement: 'true' }, // Строка вместо boolean
      headers: { ...getHeaders(), 'X-Registration-Token': 'dummy' }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).code).toBe('VALIDATION_ERROR');
  });

  test.skip('TC_104: Истекший registration_token', async ({ request }) => {
    // TODO: Нужен просроченный токен (подождать 600 секунд или попросить у разраба).
  });

  test.skip('TC_105: Повторное использование registration_token', async ({ request }) => {
    // TODO: Сначала успешно завершить регистрацию (TC_090), а потом использовать тот же токен еще раз.
    // Ожидаем 401 TOKEN_USED.
  });
});
