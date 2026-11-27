import dotenv from 'dotenv';
dotenv.config(); // Загружаем переменные из локального файла .env

export const config = {
  baseUrl: 'https://stage-api.batumi.win/hap',
  
  // Берем токен из переменной окружения (process.env.PLATFORM_TOKEN)
  platformToken: process.env.PLATFORM_TOKEN || 'ТОКЕН_НЕ_УСТАНОВЛЕН'
};