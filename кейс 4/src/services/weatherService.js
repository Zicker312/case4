import { config } from '../config/index.js';
export async function getWeather(location) {
  const url = new URL(config.weatherApiUrl);
  url.searchParams.set('latitude', location.lat); url.searchParams.set('longitude', location.lon);
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max');
  url.searchParams.set('forecast_days', '3'); url.searchParams.set('timezone', 'auto');
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Weather API HTTP ${response.status}`);
    const data = await response.json();
    return { forecast: data.daily, suitable: data.daily?.precipitation_sum?.some((x, i) => Number(x || 0) === 0 && Number(data.daily.wind_speed_10m_max?.[i] || 0) < 10) || false };
  } catch (error) { return { forecast: [], suitable: false, warning: `Не удалось получить прогноз: ${error.message}` }; }
  finally { clearTimeout(timer); }
}
