/**
 * Extract the CSRF token from the XSRF-TOKEN cookie.
 * Used for manual fetch() calls that bypass Inertia's automatic CSRF handling.
 */
export function getCsrfToken(): string {
    return decodeURIComponent(
        document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || '',
    );
}
