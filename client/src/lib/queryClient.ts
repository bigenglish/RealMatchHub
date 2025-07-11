import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Overloaded version of apiRequest that supports both typed and untyped responses
export async function apiRequest<T = any>(url: string, data?: unknown): Promise<T>;
export async function apiRequest<T = any>(method: string, url: string, data?: unknown): Promise<T>;
export async function apiRequest<T = any>(
  methodOrUrl: string,
  urlOrData?: string | unknown,
  data?: unknown
): Promise<T> {
  let method: string;
  let url: string;
  let body: unknown | undefined;

  // Determine which overload was called
  if (urlOrData === undefined || typeof urlOrData !== 'string') {
    // apiRequest(url, data?) overload
    method = 'GET';
    url = methodOrUrl;
    body = urlOrData;
  } else {
    // apiRequest(method, url, data?) overload
    method = methodOrUrl;
    url = urlOrData;
    body = data;
  }

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // For HEAD and other methods that don't return content
  if (method === 'HEAD' || res.status === 204) {
    return null as unknown as T;
  }
  
  return await res.json() as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
