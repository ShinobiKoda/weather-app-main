# Weather Now

A modern weather app built with Next.js and Tailwind CSS.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Useful resources](#useful-resources)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Overview

### The challenge

Users should be able to:

- Search for weather information by entering a location
- View current weather conditions and details
- See additional metrics like humidity, wind speed, precipitation
- Browse a 7-day forecast and hourly forecast
- Switch between days and units (Metric)
- Switch between specific temperature units and measurement units for wind speed
- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page
- Responsive layout for all devices
- View chance of precipitation (probability %) and feels-like temperature
- Add / select favorite locations for quick access
- Automatically detect approximate location on first load (IP-based) with geolocation as a silent fallback
- Graceful boot splash overlay with subtle motion while first weather + location loads
- Resilient error handling with retry UI when location or API calls fail
- Accessible keyboard navigation for search & suggestions
- Animated caret typing headline for subtle UX delight

### Screenshot

| Desktop View | Mobile View |
| ------------ | ----------- |
| <img width="600" alt="Weather Now Desktop" src="https://github.com/user-attachments/assets/bd19e4ec-45bd-4454-8c37-fb474e7c46af" /> | <img width="375" height="2591" alt="FireShot Capture 031 - Weather Now -  localhost" src="https://github.com/user-attachments/assets/41674cd9-7ea0-48a4-b610-3ee02736ee14" /> |

### Links


- Solution URL: [Click Here](https://github.com/ShinobiKoda/weather-app-main)
- Live Site URL: [Click Here](https://weather-app-main-henna.vercel.app/)

## My process

### Built with

- Next.js
- React
- Tailwind CSS
- Motion
- Mobile-first workflow
- TypeScript (strict typed weather + location models)
- Open-Meteo Forecast + Geocoding APIs
- ipapi.co (IP-based coarse location)
- Nominatim reverse geocoding proxy (for human-readable locality fallback)
- CSS logical & fluid units + responsive grid layout

### What I learned

- Integrating the Open-Meteo API and shaping its response into typed hourly/daily/current payloads in TypeScript.
- Building a responsive UI with Next.js + Tailwind and small motion animations for polish.
- Implementing a search with live suggestions (and clearing suggestions on action) for a smoother UX.
- Designing a location resolution pipeline that prioritizes privacy + UX:
  1. IP-based lookup (no permission prompt, fast)
  2. Geolocation as a silent precision fallback only if IP fails
  3. Reverse geocoding (Nominatim) to get a human readable label
- Merging multiple data sources (IP + reverse geocode) to avoid raw coordinate display when locality granularity varies.
- Mapping Open-Meteo weather codes into a consistent local icon set & normalizing missing fields.
- Handling precipitation probability and aligning hourly indices with current weather time.
- Creating a resilient splash / boot overlay that disappears only after a minimum perceptual load time.
- Crafting accessible & debounced typeahead suggestions with cancellation via AbortController.
- Persisting user preferences (temperature unit, wind unit, favorites) in localStorage with safe guards for SSR.

Small example — fetch current weather and some properties:

```typescript
import fetchWeather from "src/app/api/open-meto";

async function showWeather() {
  const data = await fetchWeather(51.51, -0.13); // lat, lon
  console.log(
    data.current.temperature,
    data.properties.precipitation_probability
  );
}

showWeather();
```

Location resolution flow (simplified):

```mermaid
flowchart LR
  A[Page Load] --> B[IP Lookup ipapi.co]
  B -->|Success| C[Coords]
  B -->|Fail| D[Browser Geolocation]
  D -->|Success| C
  D -->|Fail| E[Abort -> Null]
  C --> F[Reverse Geocode (/api/nominatim proxy)]
  F --> G[Merge (city/region/country fallback to IP data)]
```

Code: use the user location helper

```ts
import { fetchUserLocation } from "@/lib/fetchUserLocation";

async function init() {
  const loc = await fetchUserLocation();
  if (!loc) {
    console.log("Could not resolve location");
    return;
  }
  console.log(
    "User location:",
    loc.city,
    loc.region,
    loc.country,
    loc.latitude,
    loc.longitude
  );
}

init();
```

Weather payload shape (excerpt):

```ts
type WeatherPayload = {
  current: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
  properties: {
    feels_like?: number | null;
    humidity?: number | null;
    wind?: number | null;
    precipitation?: number | null;
    precipitation_probability?: number | null;
  };
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    weathercode: number;
    icon: string;
  }>;
  hourly: Array<{
    time: string;
    temp: number;
    weathercode: number;
    icon: string;
    precipitation?: number;
    precipitation_probability?: number;
  }>;
};
```

Running locally:

```
npm install
npm run dev
```

Then open http://localhost:3000

Error handling patterns:

- Centralized API error message component with retry
- Defensive optional chaining & numeric validation from external API
- Abortable suggestion queries (debounced 300ms)

Potential future improvements:

- Server side pre-render with user-approx region (edge geo headers)
- Cache reverse geocode results in memory/sessionStorage
- Add unit tests for weather code mapping & hour alignment
- Offline mode with last-known weather snapshot

### Useful resources

- Open-Meteo Docs: https://open-meteo.com/
- Weather Codes Reference: https://open-meteo.com/en/docs
- MDN Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- ipapi.co: https://ipapi.co/
- Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
- Tailwind CSS Docs: https://tailwindcss.com/
- Framer Motion (Motion) API: https://motion.dev/

## Author

- Frontend Mentor - [Praise Adebiyi](https://www.frontendmentor.io/home)
- Twitter - [sirp_xo](https://x.com/sirp_xo)
