export type UserLocation = {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
};

async function reverseGeocode(lat: number, lon: number): Promise<Partial<UserLocation>> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lon),
    });

    const res = await fetch(`/api/nominatim?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return {};

    const data = await res.json();
    const addr = data?.address as Record<string, unknown> | undefined;

    return {
      city: addr?.city || addr?.town || addr?.village || addr?.hamlet
        ? String(addr.city || addr.town || addr.village || addr.hamlet)
        : undefined,
      region: addr?.state || addr?.county
        ? String(addr.state || addr.county)
        : undefined,
      country: addr?.country ? String(addr.country) : undefined,
    };
  } catch (err) {
    console.warn("Reverse geocoding failed:", err);
    return {};
  }
}

export async function fetchUserLocation(): Promise<UserLocation | null> {
  try {
    let latitude: number | null = null;
    let longitude: number | null = null;

    // 1. Try browser geolocation
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch (err) {
        console.warn("Navigator geolocation failed:", err);
      }
    }

    // 2. Fallback: IP-based lookup
    if (latitude == null || longitude == null) {
      try {
        const ipRes = await fetch("https://ipapi.co/json/", { cache: "no-store" });
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          latitude = Number(ipData.latitude ?? ipData.lat ?? null);
          longitude = Number(ipData.longitude ?? ipData.lon ?? null);
        }
      } catch (err) {
        console.warn("IP lookup failed:", err);
      }
    }

    // If still nothing, give up
    if (latitude == null || longitude == null) return null;

    // 3. Reverse geocode for human-readable location
    const place = await reverseGeocode(latitude, longitude);

    return {
      latitude,
      longitude,
      ...place,
    };
  } catch (err) {
    console.error("fetchUserLocation failed:", err);
    return null;
  }
}
