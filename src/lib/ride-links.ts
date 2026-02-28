export function getUberDeepLink(lat: number, lng: number, name: string): string {
  const params = new URLSearchParams({
    action: "setPickup",
    "dropoff[latitude]": String(lat),
    "dropoff[longitude]": String(lng),
    "dropoff[nickname]": name,
  });

  return `uber://?${params.toString()}`;
}

export function getLyftDeepLink(lat: number, lng: number): string {
  const params = new URLSearchParams({
    ridetype: "lyft",
    "destination[latitude]": String(lat),
    "destination[longitude]": String(lng),
  });

  return `lyft://?${params.toString()}`;
}

export function getUberWebFallback(lat: number, lng: number, name: string): string {
  const params = new URLSearchParams({
    action: "setPickup",
    "dropoff[latitude]": String(lat),
    "dropoff[longitude]": String(lng),
    "dropoff[nickname]": name,
  });

  return `https://m.uber.com/ul/?${params.toString()}`;
}

export function getLyftWebFallback(lat: number, lng: number): string {
  const params = new URLSearchParams({
    "destination[latitude]": String(lat),
    "destination[longitude]": String(lng),
  });

  return `https://ride.lyft.com/?${params.toString()}`;
}
