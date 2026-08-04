const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
  endpoint: string,
  options?: RequestInit
) {
  return fetch(`${API_URL}${endpoint}`, options);
}