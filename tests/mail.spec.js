import { test, expect } from '@playwright/test';

test('Проверка входа в почту Mailpit', async ({ page }) => {
  // Переходим на почту
  await page.goto('https://hap.batumi.win/mail/');
  
  // Ждем 2 секунды, чтобы страница точно прогрузилась
  await page.waitForTimeout(2000);
  
  // Делаем скриншот, чтобы доказать, что мы там были
  await page.screenshot({ path: 'mail-page.png' });
});