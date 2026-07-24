export interface JwtPayload {
  id?: string;
  email?: string;
  role?: string;
  name?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Safely decodes a JSON Web Token (JWT) on the client side
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

/**
 * Checks if a given JWT string is valid and not expired
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const decoded = decodeJwt(token);
  if (!decoded) return false;
  if (decoded.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp <= currentTime) {
      return false; // Token expired
    }
  }
  return true;
}
