'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  lat?: number;
  lon?: number;
  tz?: string;
  refreshMinutes?: number;
  showSeconds?: boolean;
  compact?: boolean;
};

type WeatherData = {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
};

const weatherCodeToLabel: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Céu limpo', emoji: '☀️' },
  1: { label: 'Principalmente limpo', emoji: '🌤️' },
  2: { label: 'Parcialmente nublado', emoji: '⛅' },
  3: { label: 'Nublado', emoji: '☁️' },
  45: { label: 'Névoa', emoji: '🌫️' },
  48: { label: 'Névoa (geada)', emoji: '🌫️' },
  51: { label: 'Garoa fraca', emoji: '🌦️' },
  53: { label: 'Garoa', emoji: '🌦️' },
  55: { label: 'Garoa forte', emoji: '🌧️' },
  61: { label: 'Chuva fraca', emoji: '🌦️' },
  63: { label: 'Chuva', emoji: '🌧️' },
  65: { label: 'Chuva forte', emoji: '🌧️' },
  66: { label: 'Chuva congelante fraca', emoji: '🌧️❄️' },
  67: { label: 'Chuva congelante', emoji: '🌧️❄️' },
  71: { label: 'Neve fraca', emoji: '🌨️' },
  73: { label: 'Neve', emoji: '🌨️' },
  75: { label: 'Neve forte', emoji: '❄️' },
  77: { label: 'Grãos de neve', emoji: '❄️' },
  80: { label: 'Aguaceiros fracos', emoji: '🌦️' },
  81: { label: 'Aguaceiros', emoji: '🌦️' },
  82: { label: 'Aguaceiros fortes', emoji: '⛈️' },
  85: { label: 'Aguaceiros de neve fracos', emoji: '🌨️' },
  86: { label: 'Aguaceiros de neve fortes', emoji: '❄️' },
  95: { label: 'Trovoadas', emoji: '⛈️' },
  96: { label: 'Trovoadas (granizo)', emoji: '⛈️' },
  99: { label: 'Trovoadas (granizo forte)', emoji: '⛈️' },
};

export function WeatherClock({
  lat,
  lon,
  tz,
  refreshMinutes = 15,
  showSeconds = false,
  compact = true, // padrão já compacto
}: Props) {
  const [now, setNow] = useState<Date>(new Date());
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    lat !== undefined && lon !== undefined ? { lat, lon } : null
  );
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Relógio
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), showSeconds ? 1000 : 60_000);
    return () => clearInterval(id);
  }, [showSeconds]);

  // Geolocalização (se props não vierem)
  useEffect(() => {
    if (coords) return;
    if (!navigator.geolocation) {
      setErr('Geolocalização não suportada.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (e) => setErr(`Não foi possível obter localização: ${e.message}`),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [coords]);

  // Buscar clima (Open-Meteo)
  const fetchWeather = async (la: number, lo: number) => {
    try {
      setLoading(true);
      setErr(null);
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', la.toString());
      url.searchParams.set('longitude', lo.toString());
      url.searchParams.set('current_weather', 'true');
      url.searchParams.set(
        'timezone',
        tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      );

      const res = await fetch(url.toString(), { signal: ac.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const cw = json.current_weather;
      setWeather({
        temperature: cw.temperature,
        windspeed: cw.windspeed,
        weathercode: cw.weathercode,
        time: cw.time,
      });
    } catch (e: any) {
      if (e.name !== 'AbortError') setErr('Falha ao carregar clima.');
    } finally {
      setLoading(false);
    }
  };

  // disparo + refresh
  useEffect(() => {
    if (!coords) return;
    fetchWeather(coords.lat, coords.lon);
    const id = setInterval(() => fetchWeather(coords.lat, coords.lon), refreshMinutes * 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, refreshMinutes, tz]);

  // Formatadores
  const timeFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: false,
        timeZone: tz,
      });
    } catch {
      return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: false,
      });
    }
  }, [tz, showSeconds]);

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: tz,
      });
    } catch {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }
  }, [tz]);

  // Labels/emoji (AQUI definimos wEmoji/wLabel)
  const wc = weather?.weathercode ?? null;
  const wInfo = wc != null ? weatherCodeToLabel[wc] : undefined;
  const wLabel = wInfo?.label ?? (weather ? 'Tempo' : '');
  const wEmoji = wInfo?.emoji ?? '🌡️';

  // tamanhos (compacto vs normal)
  const sz = compact
    ? {
        container: 'rounded-xl p-3 gap-2 grid grid-cols-2 items-center',
        time: 'text-2xl',
        date: 'text-xs',
        emoji: 'text-2xl',
        temp: 'text-xl',
        desc: 'text-xs',
      }
    : {
        container: 'rounded-2xl p-5 gap-4 grid grid-cols-2 items-center',
        time: 'text-4xl',
        date: 'text-sm',
        emoji: 'text-5xl',
        temp: 'text-2xl',
        desc: 'text-sm',
      };

  return (
    <div
      className={`shadow-md bg-sidebar backdrop-blur border border-black/5 ${sz.container}`}
      style={{ maxWidth: 720 }}
    >
      {/* Relógio */}
      <div className="flex flex-col leading-tight">
        <div className={`${sz.time} font-semibold tracking-tight`}>
          {timeFormatter.format(now)}
        </div>
        <div className={`${sz.date} opacity-70 capitalize`}>
          {dateFormatter.format(now)}
        </div>
        {!compact && tz && (
          <div className="mt-1 text-xs opacity-60">Fuso: {tz}</div>
        )}
      </div>

      {/* Clima */}
      <div className="flex items-center justify-end gap-2">
        <div className={sz.emoji} aria-hidden>
          {wEmoji}
        </div>
        <div>
          <div className={`${sz.temp} font-medium`}>
            {loading && !weather ? 'Carregando…' : weather ? `${Math.round(weather.temperature)}°C` : '--'}
          </div>
          <div className={`${sz.desc} opacity-80`}>
            {weather ? `${wLabel} • Vento ${Math.round(weather.windspeed)} km/h` : (err || '—')}
          </div>
          {!compact && coords && (
            <div className="text-xs opacity-60 mt-1">
              Lat {coords.lat.toFixed(2)} • Lon {coords.lon.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeatherClock;