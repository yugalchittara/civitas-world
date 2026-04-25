function sameOrigin(input: Request) {
  const origin = input.headers.get("origin");
  if (!origin) return false;

  try {
    const requestUrl = new URL(input.url);
    return origin === requestUrl.origin;
  } catch {
    return false;
  }
}

export function assertSameOriginMutation(request: Request) {
  if (!sameOrigin(request)) {
    throw new Error("FORBIDDEN");
  }
}
