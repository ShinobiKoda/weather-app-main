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

### Screenshot

<!-- screenshot here -->

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

### What I learned

- Integrating the Open-Meteo API and shaping its response into typed hourly/daily/current payloads in TypeScript.
- Building a responsive UI with Next.js + Tailwind and small motion animations for polish.
- Implementing a search with live suggestions (and clearing suggestions on action) for a smoother UX.

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

### Useful resources

- <!-- Add useful resources here -->

## Author

- Frontend Mentor - [Praise Adebiyi](https://www.frontendmentor.io/home)
- Twitter - [sirp_xo](https://x.com/sirp_xo)
