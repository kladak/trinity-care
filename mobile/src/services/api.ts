const DEFAULT_API = 'http://localhost:8000';

export function getApiBase(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return DEFAULT_API;
}

export type Role = 'family' | 'facility_staff';

export type TokenResponse = {
  access_token: string;
  token_type: string;
  role: Role;
  display_name: string;
  email: string;
};

export type Resident = {
  id: number;
  display_name: string;
  facility_id: number;
  room: string;
  care_notes: string;
  facility_name?: string | null;
};

export type UpdateItem = {
  id: number;
  resident_id: number;
  author_id: number;
  update_type: 'update' | 'check_in' | 'message';
  body: string;
  created_at: string;
  author_name?: string | null;
  resident_name?: string | null;
};

export type Visit = {
  id: number;
  resident_id: number;
  requester_id: number;
  scheduled_at: string;
  notes: string;
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  resident_name?: string | null;
  requester_name?: string | null;
};

export type ResidentDetail = {
  resident: Resident;
  updates: UpdateItem[];
  visits: Visit[];
};

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const url = `${getApiBase()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(0, `Cannot reach API at ${getApiBase()}. Is the backend running?`);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, typeof detail === 'string' ? detail : 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  demoLogin: (persona: 'family' | 'staff') =>
    request<TokenResponse>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ persona }),
    }),
  me: (token: string) => request('/auth/me', { token }),
  feed: (token: string) => request<UpdateItem[]>('/feed', { token }),
  residents: (token: string) => request<Resident[]>('/residents', { token }),
  residentDetail: (token: string, id: number) =>
    request<ResidentDetail>(`/residents/${id}`, { token }),
  createUpdate: (
    token: string,
    body: { resident_id: number; update_type: string; body: string },
  ) =>
    request<UpdateItem>('/updates', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  visits: (token: string) => request<Visit[]>('/visits', { token }),
  createVisit: (
    token: string,
    body: { resident_id: number; scheduled_at: string; notes: string },
  ) =>
    request<Visit>('/visits', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  patchVisit: (token: string, id: number, status: string) =>
    request<Visit>(`/visits/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }),
};

export { ApiError };
