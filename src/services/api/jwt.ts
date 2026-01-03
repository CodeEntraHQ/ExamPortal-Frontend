/**
 * JWT token utilities
 * Provides functions to decode and check JWT token expiration
 */

interface DecodedToken {
  user_id: string;
  type: string;
  session_id?: string;
  captcha?: boolean;
  exp: number; // Expiration timestamp (Unix time in seconds)
  iat: number; // Issued at timestamp (Unix time in seconds)
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This does NOT verify the signature - only extracts payload
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * Returns true if token is expired or will expire within the buffer time
 */
export function isTokenExpired(token: string, bufferSeconds: number = 0): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  // Convert expiration time (seconds) to milliseconds and subtract buffer
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const bufferMs = bufferSeconds * 1000;
  
  return currentTime >= (expirationTime - bufferMs);
}

/**
 * Get time until token expires in milliseconds
 * Returns negative number if already expired
 */
export function getTimeUntilExpiration(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return -1;
  }
  
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  return expirationTime - currentTime;
}

/**
 * Get token expiration timestamp in milliseconds
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return decoded.exp * 1000;
}

