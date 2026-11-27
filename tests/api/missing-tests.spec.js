import { test, expect } from '@playwright/test';
import { config } from './config.js';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Platform-Authorization': `Bearer ${config.platformToken}`
});

// =====================================================================
// БЛОК 1: LOGOUT (Недостающие)
// =====================================================================
test.describe('API: /api/auth/logout/ - Недостающие', () => {
  const authHeaders = {
    ...getHeaders(),
    'X-AUTH-TOKEN': 'REAL_ACCESS_TOKEN',
    'X-REFRESH-TOKEN': 'REAL_REFRESH_TOKEN'
  };

  test.skip('TC_005: Дублирующийся заголовок X-REFRESH-TOKEN', async ({ request }) => {
    // Playwright не поддерживает дублирование заголовков напрямую в объекте, 
    // поэтому используется массив формата { name, value }.
    const response = await request.post(`${config.baseUrl}/api/auth/logout/`, {
      headers: [
        { name: 'X-Platform-Authorization', value: `Bearer ${config.platformToken}` },
        { name: 'X-AUTH-TOKEN', value: 'real_access' },
        { name: 'X-REFRESH-TOKEN', value: 'refresh1' },
        { name: 'X-REFRESH-TOKEN', value: 'refresh2' }
      ]
    });
    expect(response.status()).toBe(401);
    expect((await response.json()).code).toBe('INVALID_LOGOUT_HEADERS');
  });

  test.skip('TC_007: Невалидный refresh-токен', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/logout/`, {
      headers: { ...getHeaders(), 'X-AUTH-TOKEN': 'real_access', 'X-REFRESH-TOKEN': 'invalid.token' }
    });
    expect(response.status()).toBe(401);
    expect((await response.json()).code).toBe('INVALID_TOKEN');
  });

  test.skip('TC_009: Истекший refresh-токен', async ({ request }) => {
    // TODO: Нужен просроченный токен
  });

  test.skip('TC_010: Повторный logout с отозванным refresh', async ({ request }) => {
    // TODO: Сначала успешный logout, затем повторный с теми же токенами. Ожидаем TOKEN_REVOKED.
  });

  test.skip('TC_012: Внутренняя ошибка сервера (500)', async ({ request }) => {
    // TODO: Требуется падение БД.
  });
});

// =====================================================================
// БЛОК 2: TOKEN REFRESH (Недостающие)
// =====================================================================
test.describe('API: /api/auth/token/refresh/ - Недостающие', () => {
  
  test.skip('TC_014: Структура access-токена в ответе', async ({ request }) => {
    // TODO: Нужен реальный refresh, декодируем JWT и проверяем payload (sub, user).
  });

  test.skip('TC_016: Новый refresh-токен работает', async ({ request }) => {
    // TODO: Берем новый refresh из предыдущего теста и делаем запрос. Ожидаем 200 OK.
  });

  test.skip('TC_026: Refresh, отозванный через logout', async ({ request }) => {
    // TODO: Логинимся, делаем logout, пытаемся использовать старый refresh. Ожидаем TOKEN_REVOKED.
  });

  test.skip('TC_028: Внутренняя ошибка сервера (500)', async ({ request }) => {
    // TODO: Требуется падение БД.
  });
});

// =====================================================================
// БЛОК 3: TURNSTILE (Недостающие)
// =====================================================================
test.describe('API: /api/auth/turnstile/ - Недостающие', () => {

  test('TC_031: site_key не пустой', async ({ request }) => {
    const response = await request.get(`${config.baseUrl}/api/auth/turnstile/`, { headers: getHeaders() });
    const body = await response.json();
    expect(typeof body.site_key).toBe('string');
    expect(body.site_key.length).toBeGreaterThan(0);
  });

  test('TC_032: Заголовок Content-Type ответа', async ({ request }) => {
    const response = await request.get(`${config.baseUrl}/api/auth/turnstile/`, { headers: getHeaders() });
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_034: Повторные запросы возвращают те же настройки', async ({ request }) => {
    const res1 = await request.get(`${config.baseUrl}/api/auth/turnstile/`, { headers: getHeaders() });
    const res2 = await request.get(`${config.baseUrl}/api/auth/turnstile/`, { headers: getHeaders() });
    const body1 = await res1.json();
    const body2 = await res2.json();
    expect(body1.provider).toBe(body2.provider);
    expect(body1.site_key).toBe(body2.site_key);
  });

  test.skip('TC_036: Работа эндпоинта после окончания лимита', async ({ request }) => {
    // TODO: Требует ожидания или сброса лимита на сервере.
  });
});

// =====================================================================
// БЛОК 4: OTP REQUEST (Недостающие)
// =====================================================================
test.describe('API: /api/auth/otp/request/ - Недостающие', () => {

  test('TC_051: Запрос без тела или с некорректным JSON', async ({ request }) => {
    // Без тела
    const res1 = await request.post(`${config.baseUrl}/api/auth/otp/request/`, { headers: getHeaders() });
    expect(res1.status()).toBe(400);
    // С битым JSON
    const res2 = await request.post(`${config.baseUrl}/api/auth/otp/request/`, {
      data: '{"email": ', headers: getHeaders()
    });
    expect(res2.status()).toBe(400);
  });

  test.skip('TC_049: Повторное использование turnstile_token', async ({ request }) => {
    // TODO: Нужен валидный turnstile, который уже был использован. Ожидаем INVALID_TOKEN.
  });

  test.skip('TC_054: Запрос без заголовков авторизации', async ({ request }) => {
    // TODO: Согласно Swagger, этот эндпоинт (в старых версиях) мог не требовать Platform-токен. 
    // Сейчас Stage требует его. Тест пропускаем во избежание ложных падений.
  });

  test.skip('TC_055: Внутренняя ошибка сервера (500)', async ({ request }) => {
    // TODO: Требуется падение почтового сервиса.
  });
});

// =====================================================================
// БЛОК 5: OTP VERIFY (Недостающие)
// =====================================================================
test.describe('API: /api/auth/otp/verify/ - Недостающие', () => {

  test('TC_079: Запрос без тела или с некорректным JSON', async ({ request }) => {
    const res1 = await request.post(`${config.baseUrl}/api/auth/otp/verify/`, { headers: getHeaders() });
    expect(res1.status()).toBe(400);
    const res2 = await request.post(`${config.baseUrl}/api/auth/otp/verify/`, {
      data: '{"email": ', headers: getHeaders()
    });
    expect(res2.status()).toBe(400);
  });

  test.skip('TC_057: Структура access-токена после входа', async ({ request }) => { /* TODO */ });
  test.skip('TC_058: Токены после входа рабочие', async ({ request }) => { /* TODO */ });
  test.skip('TC_060: Email в другом регистре', async ({ request }) => { /* TODO */ });
  test.skip('TC_064: Верный код после исчерпания попыток', async ({ request }) => { /* TODO */ });
  test.skip('TC_066: Повторное использование кода', async ({ request }) => { /* TODO */ });
  test.skip('TC_067: Код от предыдущего запроса OTP', async ({ request }) => { /* TODO */ });
  test.skip('TC_068: Код, выданный для другого email', async ({ request }) => { /* TODO */ });
  test.skip('TC_069: OTP не запрашивался для email', async ({ request }) => { /* TODO */ });
  test.skip('TC_080: Запрос без заголовков авторизации', async ({ request }) => { /* TODO */ });
  test.skip('TC_081: Внутренняя ошибка сервера (500)', async ({ request }) => { /* TODO */ });
  test.skip('TC_082: Верный код на последней (5-й) попытке', async ({ request }) => { /* TODO */ });
  test.skip('TC_083: Новый OTP после исчерпания попыток', async ({ request }) => { /* TODO */ });
  test.skip('TC_084: Запрос нового OTP до окончания 60 секунд', async ({ request }) => { /* TODO */ });
  test.skip('TC_085: Код действует до истечения 300 секунд', async ({ request }) => { /* TODO */ });
  test.skip('TC_086: Сброс счетчика попыток после нового OTP', async ({ request }) => { /* TODO */ });
  test.skip('TC_087: Новый код работает после повторного запроса', async ({ request }) => { /* TODO */ });
  test.skip('TC_088: Ошибка отправки письма', async ({ request }) => { /* TODO */ });
  test.skip('TC_089: Ошибка валидации не расходует попытку', async ({ request }) => { /* TODO */ });
});

// =====================================================================
// БЛОК 6: REGISTRATION COMPLETE (Недостающие)
// =====================================================================
test.describe('API: /api/auth/registration/complete/ - Недостающие', () => {

  test('TC_099: Запрос без тела или с некорректным JSON', async ({ request }) => {
    const res1 = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, { 
      headers: { ...getHeaders(), 'X-Registration-Token': 'dummy' } 
    });
    expect(res1.status()).toBe(400);
  });

  test('TC_100: Лишнее поле в теле', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: { agreement: true, extra: 'x' }, 
      headers: { ...getHeaders(), 'X-Registration-Token': 'dummy' }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).code).toBe('VALIDATION_ERROR');
  });

  test('TC_106: Access-токен вместо registration_token', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: { agreement: true },
      headers: { ...getHeaders(), 'X-Registration-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy' }
    });
    expect(response.status()).toBe(401);
    expect((await response.json()).code).toBe('INVALID_TOKEN');
  });

  test('TC_107: Registration_token передан в другом заголовке', async ({ request }) => {
    const response = await request.post(`${config.baseUrl}/api/auth/registration/complete/`, {
      data: { agreement: true },
      headers: { ...getHeaders(), 'X-AUTH-TOKEN': 'dummy' } // Передали в X-AUTH-TOKEN
    });
    expect(response.status()).toBe(401);
    expect((await response.json()).code).toBe('MISSING_TOKEN');
  });

  test.skip('TC_091: Структура access-токена после регистрации', async ({ request }) => { /* TODO */ });
  test.skip('TC_092: Токены после регистрации рабочие', async ({ request }) => { /* TODO */ });
  test.skip('TC_093: Вход по OTP после регистрации', async ({ request }) => { /* TODO */ });
  test.skip('TC_094: Токен действует до истечения 600 секунд', async ({ request }) => { /* TODO */ });
  test.skip('TC_096: Повторный запрос с согласием после отказа', async ({ request }) => { /* TODO */ });
  test.skip('TC_108: Внутренняя ошибка сервера (500)', async ({ request }) => { /* TODO */ });
});