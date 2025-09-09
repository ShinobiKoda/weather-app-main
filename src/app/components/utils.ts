export function formatLongDate(isoOrDate?: string | Date) {
  const d = isoOrDate ? new Date(isoOrDate) : new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
