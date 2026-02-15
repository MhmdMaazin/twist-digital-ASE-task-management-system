const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      data.error?.message || 'An error occurred',
      response.status,
      data.error?.details
    );
  }

  return data.data;
}

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchAPI('/api/auth/logout', {
      method: 'POST',
    }),

  refresh: () =>
    fetchAPI('/api/auth/refresh', {
      method: 'POST',
    }),

  me: () => fetchAPI('/api/auth/me'),
};

// Tasks API
export const tasksAPI = {
  getAll: () => fetchAPI('/api/tasks'),

  getById: (id: string) => fetchAPI(`/api/tasks/${id}`),

  create: (data: any) =>
    fetchAPI('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchAPI(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),

  getStats: () => fetchAPI('/api/tasks/stats'),
};
