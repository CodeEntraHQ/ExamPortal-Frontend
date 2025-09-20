/**
 * Token management utility that extracts timing information from JWT tokens
 * and provides configuration for activity-based token renewal
 */

import { TOKEN_CONFIG } from './constants.js';

export class TokenManager {
  constructor() {
    this.RENEWAL_THRESHOLD = TOKEN_CONFIG.RENEWAL_THRESHOLD;
    this.IDLE_THRESHOLD = TOKEN_CONFIG.IDLE_THRESHOLD;
    this.CHECK_INTERVAL = TOKEN_CONFIG.CHECK_INTERVAL;
  }

  /**
   * Extract token payload without verification
   * @param {string} token - JWT token
   * @returns {object|null} - Token payload or null if invalid
   */
  extractTokenPayload(token) {
    try {
      if (!token) return null;

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Failed to extract token payload:', error);
      return null;
    }
  }

  /**
   * Get token expiry time in milliseconds
   * @param {string} token - JWT token
   * @returns {number|null} - Expiry time in milliseconds or null
   */
  getTokenExpiry(token) {
    const payload = this.extractTokenPayload(token);
    if (!payload || !payload.exp) return null;

    // Convert from seconds to milliseconds
    return payload.exp * 1000;
  }

  /**
   * Get time until token expires in milliseconds
   * @param {string} token - JWT token
   * @returns {number|null} - Time until expiry in milliseconds or null
   */
  getTimeUntilExpiry(token) {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return null;

    return expiry - Date.now();
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} - True if token is expired
   */
  isTokenExpired(token) {
    const timeUntilExpiry = this.getTimeUntilExpiry(token);
    if (timeUntilExpiry === null) return true;

    return timeUntilExpiry <= 0;
  }

  /**
   * Check if token should be renewed (within renewal threshold)
   * @param {string} token - JWT token
   * @returns {boolean} - True if token should be renewed
   */
  shouldRenewToken(token) {
    const timeUntilExpiry = this.getTimeUntilExpiry(token);
    if (timeUntilExpiry === null) return false;

    return timeUntilExpiry <= this.RENEWAL_THRESHOLD && timeUntilExpiry > 0;
  }

  /**
   * Get token configuration from the token itself
   * @param {string} token - JWT token
   * @returns {object} - Token configuration
   */
  getTokenConfig(token) {
    const payload = this.extractTokenPayload(token);
    const expiry = this.getTokenExpiry(token);
    const timeUntilExpiry = this.getTimeUntilExpiry(token);

    return {
      payload,
      expiry,
      timeUntilExpiry,
      isExpired: this.isTokenExpired(token),
      shouldRenew: this.shouldRenewToken(token),
      renewalThreshold: this.RENEWAL_THRESHOLD,
      idleThreshold: this.IDLE_THRESHOLD,
      checkInterval: this.CHECK_INTERVAL,
    };
  }

  /**
   * Format time remaining for display
   * @param {number} milliseconds - Time in milliseconds
   * @returns {string} - Formatted time string
   */
  formatTimeRemaining(milliseconds) {
    if (milliseconds <= 0) return '0 seconds';

    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  /**
   * Get user session information from token
   * @param {string} token - JWT token
   * @returns {object|null} - Session info or null
   */
  getSessionInfo(token) {
    const payload = this.extractTokenPayload(token);
    if (!payload) return null;

    return {
      userId: payload.user_id,
      sessionId: payload.session_id,
      tokenType: payload.type,
      issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
      timeUntilExpiry: this.getTimeUntilExpiry(token),
    };
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
