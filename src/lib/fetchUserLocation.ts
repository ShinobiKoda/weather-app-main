export type UserLocation = {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
};

async function reverseGeocode(
  lat: number,
  lon: number
): Promise<Partial<UserLocation>> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lon),
    });

    const res = await fetch(`/api/nominatim?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return {};

    const data = await res.json();
    const addr = data?.address as Record<string, unknown> | undefined;

    const cityLike = ((): string | undefined => {
      const c = (addr?.city || addr?.town || addr?.village || addr?.hamlet) as
        | string
        | undefined;
      if (c && String(c).trim().length > 0) return String(c);
      if (addr?.county && String(addr.county).trim().length > 0)
        return String(addr.county);
      return undefined;
    })();

    return {
      city: cityLike,
      region:
        addr?.state || addr?.county
          ? String(addr.state || addr.county)
          : undefined,
      country: addr?.country ? String(addr.country) : undefined,
    };
  } catch (err) {
    console.warn("Reverse geocoding failed:", err);
    return {};
  }
}

async function ipLookup(): Promise<UserLocation | null> {
  try {
    const ipRes = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!ipRes.ok) return null;
    const ipData = await ipRes.json();
    const latitude = Number(ipData.latitude ?? ipData.lat ?? NaN);
    const longitude = Number(ipData.longitude ?? ipData.lon ?? NaN);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    return {
      latitude,
      longitude,
      city: ipData.city ? String(ipData.city) : undefined,
      region:
        ipData.region || ipData.region_code
          ? String(ipData.region || ipData.region_code)
          : undefined,
      country:
        ipData.country_name || ipData.country
          ? String(ipData.country_name || ipData.country)
          : undefined,
    };
  } catch (err) {
    console.warn("IP lookup failed:", err);
    return null;
  }
}

async function browserGeolocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator))
    return null;
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch (err) {
    console.warn("Navigator geolocation failed:", err);
    return null;
  }
}

export async function fetchUserLocation(): Promise<UserLocation | null> {
  try {
    const ipPromise = ipLookup();
    const gpsPromise = browserGeolocation();

    const ipData = await ipPromise;
    const coords = ipData
      ? { latitude: ipData.latitude, longitude: ipData.longitude }
      : null;

    const place = coords
      ? await reverseGeocode(coords.latitude, coords.longitude)
      : {};

    let location: UserLocation | null = coords
      ? {
          latitude: coords.latitude,
          longitude: coords.longitude,
          city: place.city ?? ipData?.city,
          region: place.region ?? ipData?.region,
          country: place.country ?? ipData?.country,
        }
      : null;

    const gpsCoords = await gpsPromise;
    if (gpsCoords) {
      const gpsPlace = await reverseGeocode(
        gpsCoords.latitude,
        gpsCoords.longitude
      );
      location = {
        latitude: gpsCoords.latitude,
        longitude: gpsCoords.longitude,
        city: gpsPlace.city ?? location?.city,
        region: gpsPlace.region ?? location?.region,
        country: gpsPlace.country ?? location?.country,
      };
    }

    return location;
  } catch (err) {
    console.error("fetchUserLocation failed:", err);
    return null;
  }
}
