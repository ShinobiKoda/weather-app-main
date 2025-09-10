export function formatLongDate(isoOrDate?: string | Date) {
  const d = isoOrDate ? new Date(isoOrDate) : new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function convertTemp(valueC: number, unit: "C" | "F") {
  if (!Number.isFinite(valueC)) return NaN;
  return unit === "C" ? valueC : (valueC * 9) / 5 + 32;
}

export function convertWind(valueKmh: number, unit: "kmh" | "mph") {
  if (!Number.isFinite(valueKmh)) return NaN;
  return unit === "kmh" ? valueKmh : valueKmh * 0.62137119223733;
}

export function convertPrecip(valueMm: number, unit: "mm" | "in") {
  if (!Number.isFinite(valueMm)) return NaN;
  return unit === "mm" ? valueMm : valueMm / 25.4;
}
