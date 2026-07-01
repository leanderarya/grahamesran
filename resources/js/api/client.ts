import { isNative } from '@/lib/capacitor';

const API_BASE = '/api';

function getToken(): string | null {
    return localStorage.getItem('kasir_token');
}

export function setToken(token: string): void {
    localStorage.setItem('kasir_token', token);
}

export function clearToken(): void {
    localStorage.removeItem('kasir_token');
}

export function hasToken(): boolean {
    return getToken() !== null;
}

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

async function request<T = any>(
    endpoint: string,
    options: ApiOptions = {},
): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    const token = getToken();

    const fetchHeaders: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
    };

    if (token) {
        fetchHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: fetchHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        if (response.status === 401) {
            clearToken();
            window.location.href = '/pin-login';
            throw new Error('Unauthorized');
        }

        const errorData = await response.json().catch(() => ({}));
        throw {
            status: response.status,
            message: errorData.message || 'Terjadi kesalahan.',
            errors: errorData.errors || {},
        };
    }

    return response.json();
}

export const apiClient = {
    get: <T = any>(endpoint: string) => request<T>(endpoint),

    post: <T = any>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: 'POST', body }),

    put: <T = any>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: 'PUT', body }),

    delete: <T = any>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),
};
