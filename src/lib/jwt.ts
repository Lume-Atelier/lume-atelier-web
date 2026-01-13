/**
 * JWT Utility Functions
 *
 * Provides functions for decoding and validating JWT tokens.
 * Note: Client-side validation is for UX only. Server-side validation is authoritative.
 */

export interface JWTPayload {
  id?: string;
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  authorities?: string[];
  scope?: string;
  exp?: number; // Expiration timestamp (seconds since epoch)
  iat?: number; // Issued at timestamp
  [key: string]: any;
}

/**
 * Decodes a JWT token without verifying the signature.
 *
 * SECURITY NOTE: This does NOT verify the token's signature.
 * Always validate tokens on the server-side. Client-side decoding
 * is only for UX purposes (e.g., extracting role, checking expiration).
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1]; // Get payload (middle part)
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 to JSON string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 *
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    // If token is invalid or has no expiration, consider it expired
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Math.floor(Date.now() / 1000);

  return payload.exp < currentTime;
}

/**
 * Gets the time remaining until token expiration in seconds.
 *
 * @param token - JWT token string
 * @returns Seconds until expiration, or 0 if expired/invalid
 */
export function getTokenExpirationTime(token: string): number {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = payload.exp - currentTime;

  return Math.max(0, timeRemaining);
}

/**
 * Validates a JWT token (checks structure and expiration).
 * Does NOT verify signature - server-side validation is required.
 *
 * @param token - JWT token string
 * @returns true if token is valid and not expired, false otherwise
 */
export function isTokenValid(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Check token structure
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Check expiration
  return !isTokenExpired(token);
}

/**
 * Extracts user role from JWT token.
 *
 * @param token - JWT token string
 * @returns User role (e.g., 'ADMIN', 'CUSTOMER') or null
 */
export function extractRole(token: string): string | null {
  const payload = decodeJWT(token);

  if (!payload) {
    return null;
  }

  // Try different possible role claim names
  return (
    payload.role ||
    payload.authorities?.[0] ||
    payload.scope ||
    null
  );
}

/**
 * Extracts user ID from JWT token.
 *
 * @param token - JWT token string
 * @returns User ID or null
 */
export function extractUserId(token: string): string | null {
  const payload = decodeJWT(token);

  if (!payload) {
    return null;
  }

  return payload.id || payload.sub || null;
}
