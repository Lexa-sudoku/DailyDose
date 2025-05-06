import { useErrorStore } from "@/store/error-store";

const BASE_URL = "http://147.45.185.112:8000";

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
      const RequestError = new ApiError(
        response.status,
        errorData.detail || "Request failed",
        errorData
      );

      useErrorStore.getState().setError(RequestError);
      throw RequestError;
    }

    // Для ответов без тела (например, 204)
    if (response.status === 204) {
      return null as unknown as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      useErrorStore.getState().setError(error);
      throw error;
    }
    const networkError = new ApiError(0, "Ошибка сети", {
      non_field_errors: "Network error.",
    });
    useErrorStore.getState().setError(networkError);
    throw networkError;
  }
}
