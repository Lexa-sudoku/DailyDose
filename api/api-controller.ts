const BASE_URL = "http://127.0.0.1:8000";

interface ApiRequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  headers?: Record<string, string>;
  body?: any;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions,
  authToken?: string
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`;
  }

  const config: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new ApiError(
        response.status,
        errorData.detail || "Request failed",
        errorData
      );
    }

    // Для ответов без тела (например, 204)
    if (response.status === 204) {
      return null as unknown as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, "Network error", error);
  }
}
