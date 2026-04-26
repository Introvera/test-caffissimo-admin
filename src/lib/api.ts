const DEFAULT_BACKEND_URL = "http://localhost:8080";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL.replace(/\/$/, "")}${normalizedPath}`;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  idToken?: string
) {
  const headers = new Headers(init.headers);

  if (idToken) {
    headers.set("Authorization", `Bearer ${idToken}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(buildApiUrl(path), {
    ...init,
    headers,
  });
}

export async function getApiErrorMessage(
  response: Response,
  fallback = "Request failed"
) {
  try {
    const body = await response.json();
    if (typeof body?.message === "string") {
      return body.message;
    }
    if (typeof body?.error === "string") {
      return body.error;
    }
  } catch {
    // Non-JSON error responses fall through to the generic message.
  }

  return `${fallback} (${response.status})`;
}
