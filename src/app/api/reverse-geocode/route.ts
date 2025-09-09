import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Missing latitude or longitude" },
        { status: 400 }
      );
    }

    console.log("🔎 Reverse geocode request:", { lat, lon });

    // Make sure they're valid numbers and round
    const latFixed = Number(lat).toFixed(4);
    const lonFixed = Number(lon).toFixed(4);

    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latFixed}&longitude=${lonFixed}&count=1&language=en`;

    console.log("🌍 Calling Open-Meteo:", url);

    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Open-Meteo error:", errText);
      return NextResponse.json(
        { error: "Reverse geocode failed", details: errText },
        { status: 502 }
      );
    }

    const data = await response.json();
    console.log("✅ Open-Meteo response:", data);

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ location: "Unknown location" });
    }

    const first = data.results[0];
    const place =
      first.name || first.locality || first.admin1 || first.county || "";
    const country = first.country || "";
    const location =
      place && country ? `${place}, ${country}` : place || country || "Unknown location";

    return NextResponse.json({ location });
  } catch (err) {
    console.error("💥 Server error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reverse geocode" },
      { status: 500 }
    );
  }
}
