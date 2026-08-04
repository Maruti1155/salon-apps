const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions extends RequestInit {
  body?: BodyInit | null;
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function apiFetch(
  endpoint:string,
  options?:RequestInit
){
  return fetch(
    `${API_URL}${endpoint}`,
    options
  );
}

export const authApi = {
  register: (payload: unknown) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: unknown) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};