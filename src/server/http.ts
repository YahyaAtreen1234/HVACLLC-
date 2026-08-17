/** Small helpers so every route handler returns a consistently shaped response. */

export function json(
  body: unknown,
  init?: { status?: number; headers?: Record<string, string> },
): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // API responses are per-request and must never be cached by a CDN.
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

export function errorJson(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
): Response {
  return json({ error: message, ...extra }, { status });
}
