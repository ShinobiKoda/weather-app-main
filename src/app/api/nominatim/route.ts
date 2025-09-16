import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Missing lat or lon" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({ format: "jsonv2", lat, lon });
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;

    // Server-side fetch to Nominatim (no CORS issues). Include a User-Agent per policy.
    const res = await fetch(nomUrl, {
      headers: {
        "User-Agent": "weather-app-main (https://example.com)",
        Accept: "application/json",
      },
    });

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
