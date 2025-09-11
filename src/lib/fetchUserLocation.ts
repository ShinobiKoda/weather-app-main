export type UserLocation = {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
};

export async function fetchUserLocation(): Promise<UserLocation | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!res.ok) {
      console.error("ipapi.co returned", res.status, res.statusText);
      return null;
    }
    const data = await res.json();

    const lat = data.latitude ?? data.lat ?? null;
    const lon = data.longitude ?? data.lon ?? null;
    if (lat == null || lon == null) return null;

    return {
      latitude: Number(lat),
      longitude: Number(lon),
      city: data.city ?? undefined,
      region: data.region ?? undefined,
      country: data.country_name ?? data.country ?? undefined,
    };
  } catch (err) {
    console.error("fetchUserLocation failed:", err);
    return null;
  }
}
