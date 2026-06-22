export async function POST(req) {
  try {
    const { url } = await req.json();

    const response = await fetch(url, {
      redirect: "follow",
    });

    const finalUrl = response.url;

    const coords = extractCoordinates(finalUrl);

    return Response.json({
      success: true,
      finalUrl,
      latitude: coords?.lat || null,
      longitude: coords?.lng || null,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}

function extractCoordinates(url) {
  let match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  }

  match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  }

  return null;
}
