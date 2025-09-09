export type HourlyForecastItem = {
  time: string; // ISO time
  temp: number;
  weathercode: number;
  icon: string;
};

export type DailyForecastItem = {
  date: string; // YYYY-MM-DD
  maxTemp: number;
  minTemp: number;
  weathercode: number;
  icon: string;
};

export type WeatherProperties = {
  feels_like?: number | null;
  humidity?: number | null;
  wind?: number | null; // km/h
  precipitation?: number | null; // mm (last hour or accumulated as provided)
};

export type WeatherPayload = {
  current: {
    temperature: number;
    windspeed: number;
    winddirection?: number;
    weathercode: number;
    time: string;
  };
  properties: WeatherProperties;
  daily: DailyForecastItem[];
  hourly: HourlyForecastItem[];
};

function weatherCodeToIcon(code: number) {
  if (code === 0) return "/images/icon-sunny.webp"; // clear
  if (code === 1 || code === 2 || code === 3)
    return "/images/icon-partly-cloudy.webp"; // mainly clear / partly cloudy
  if (code === 45 || code === 48) return "/images/icon-fog.webp"; // fog
  if (
    (code >= 51 && code <= 57) ||
    (code >= 61 && code <= 67) ||
    (code >= 80 && code <= 82)
  )
    return "/images/icon-drizzle.webp"; // drizzle / rain
  if ((code >= 63 && code <= 65) || (code >= 85 && code <= 86))
    return "/images/icon-rain.webp"; // rain
  if (code >= 71 && code <= 77) return "/images/icon-snow.webp"; // snow and ice
  if (code >= 95 && code <= 99) return "/images/icon-storm.webp"; // thunderstorm
  return "/images/icon-overcast.webp"; // fallback
}


export async function fetchWeather(
  latitude: number,
  longitude: number,
  timezone = "auto"
): Promise<WeatherPayload> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current_weather", "true");
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "apparent_temperature",
      "relativehumidity_2m",
      "precipitation",
      "weathercode",
    ].join(",")
  );
  url.searchParams.set(
    "daily",
    ["temperature_2m_max", "temperature_2m_min", "weathercode"].join(",")
  );
  url.searchParams.set("timezone", timezone);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (!data || !data.current_weather || !data.hourly) {
    throw new Error("Unexpected Open-Meteo response shape");
  }

  const current = {
    temperature: Number(data.current_weather.temperature),
    windspeed: Number(data.current_weather.windspeed),
    winddirection: data.current_weather.winddirection
      ? Number(data.current_weather.winddirection)
      : undefined,
    weathercode: Number(data.current_weather.weathercode),
    time: String(data.current_weather.time),
  };

  const hourlyTimes: string[] = data.hourly.time || [];
  const hourlyTemps: number[] = (data.hourly.temperature_2m || []).map(Number);
  const hourlyWeathercodes: number[] = (data.hourly.weathercode || []).map(
    Number
  );

  const hourly: HourlyForecastItem[] = hourlyTimes
    .map((t: string, i: number) => ({
      time: t,
      temp: hourlyTemps[i] ?? NaN,
      weathercode: hourlyWeathercodes[i] ?? 0,
      icon: weatherCodeToIcon(Number(hourlyWeathercodes[i] ?? 0)),
    }))
    .slice(0, 24);

  // Daily
  const dailyDates: string[] = data.daily.time || [];
  const dailyMax: number[] = (data.daily.temperature_2m_max || []).map(Number);
  const dailyMin: number[] = (data.daily.temperature_2m_min || []).map(Number);
  const dailyWeathercodes: number[] = (data.daily.weathercode || []).map(
    Number
  );

  const daily: DailyForecastItem[] = dailyDates.map((d: string, i: number) => ({
    date: d,
    maxTemp: dailyMax[i] ?? NaN,
    minTemp: dailyMin[i] ?? NaN,
    weathercode: dailyWeathercodes[i] ?? 0,
    icon: weatherCodeToIcon(Number(dailyWeathercodes[i] ?? 0)),
  }));

  let feels_like: number | null = null;
  const apparentTemps: number[] = (data.hourly.apparent_temperature || []).map(
    Number
  );
  const humidities: number[] = (data.hourly.relativehumidity_2m || []).map(
    Number
  );
  const precipitations: number[] = (data.hourly.precipitation || []).map(
    Number
  );

  const currentIndex = hourlyTimes.indexOf(current.time);
  if (currentIndex >= 0) {
    feels_like = Number.isFinite(apparentTemps[currentIndex])
      ? apparentTemps[currentIndex]
      : null;
  }

  const properties: WeatherProperties = {
    feels_like,
    humidity:
      currentIndex >= 0 && Number.isFinite(humidities[currentIndex])
        ? humidities[currentIndex]
        : null,
    wind: Number.isFinite(current.windspeed) ? current.windspeed : null,
    precipitation:
      currentIndex >= 0 && Number.isFinite(precipitations[currentIndex])
        ? precipitations[currentIndex]
        : null,
  };

  return {
    current,
    properties,
    daily,
    hourly,
  } as WeatherPayload;
}

export default fetchWeather;
