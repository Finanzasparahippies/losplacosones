const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    // Optional: Handle token refresh or logout
    localStorage.removeItem('access_token');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
    
    // Handle DRF validation errors (object with field keys)
    if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
      const messages = Object.entries(errorData).map(([key, value]) => {
        const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
        const errorMsg = Array.isArray(value) ? value[0] : value;
        return `${fieldName}: ${errorMsg}`;
      });
      throw new Error(messages.join(' | '));
    }

    throw new Error(errorData.detail || errorData.message || "An error occurred");
  }

  return res.json();
}

export const auth = {
  login: async (email: string, password: string) => {
    const data = await fetcher('/users/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  getUser: () => fetcher('/users/profile/'),
};
