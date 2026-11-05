export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

type Options = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
};

async function request<T>(path: string, { method = 'GET', body, signal }: Options = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: 'Unexpected server response' };
    }
  }

  if (!res.ok) {
    const payload = (data || {}) as { error?: string; fields?: Record<string, string> };
    throw new ApiError(payload.error || 'Request failed', res.status, payload.fields);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ?? {} }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ?? {} }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  async upload(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: form, credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data?.error || 'Upload failed', res.status);
    return data as { url: string };
  },
};

export const currencySafe = (value: string) => value;
