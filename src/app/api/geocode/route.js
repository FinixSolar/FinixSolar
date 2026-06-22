export async function POST(request) {
  try {
    const { address } = await request.json();

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        address,
      )}`,
      {
        headers: {
          "User-Agent": "FinixSolar/1.0",
          Accept: "application/json",
        },
      },
    );

    const data = await response.json();

    return Response.json({
      success: true,
      data: data,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to geocode address" },
      { status: 500 },
    );
  }
}
