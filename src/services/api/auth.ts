/**
 * Authentication API service
 * Handles login, password reset, and related auth operations
 */

import { authenticatedFetch, getApiUrl, getToken, setToken } from './core';

export interface LoginResponse {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'SUPERADMIN' | 'ADMIN' | 'STUDENT';
    entity_id?: string;
    entity_name?: string;
    entityId?: string; // For backward compatibility
    entityName?: string; // For backward compatibility
    profile_picture_link?: string;
    phone_number?: string;
    address?: string;
    bio?: string;
    created_at?: string;
    gender?: string;
    roll_number?: string;
    last_login_at?: string;
    two_fa_enabled?: boolean;
  };
  requires2FA?: boolean;
  token?: string;
}

/**
 * Login user
 */
export async function login(email: string, password: string, otp?: string): Promise<LoginResponse> {
  const body: { email: string; password: string; authentication_code?: string } = {
    email,
    password,
  };

  if (otp) {
    body.authentication_code = otp;
  }

  const response = await authenticatedFetch(getApiUrl('/v1/users/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  // Check if 2FA is required
  if (data.message === 'AUTHENTICATION_CODE_REQUIRED' || data.message === 'AUTHENTICATION_CODE_REQUIRED') {
    return { requires2FA: true };
  }

  // Store token if provided
  if (data.payload?.token) {
    setToken(data.payload.token);
  }

  // Normalize entity field names (backend uses entity_id/entity_name, frontend uses entityId/entityName)
  const userData = data.payload?.user || data.payload;
  if (userData) {
    userData.entityId = userData.entityId || userData.entity_id;
    userData.entityName = userData.entityName || userData.entity_name;
  }

  return {
    user: userData,
    token: data.payload?.token,
    requires2FA: false,
  };
}

/**
 * Forgot password - request password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  const response = await authenticatedFetch(getApiUrl('/v1/users/password/forgot'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  await response.json();
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ responseCode: string; responseMessage?: string }> {
  const response = await authenticatedFetch(getApiUrl('/v1/users/password/reset'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      new_password: newPassword,
    }),
  });

  return response.json();
}

/**
 * Resend OTP for 2FA
 */
export async function resendOTP(): Promise<void> {
  const response = await authenticatedFetch(getApiUrl('/v1/users/two-fa/generate'), {
    method: 'GET',
  });

  await response.json();
}

/**
 * Logout user
 * Calls the backend logout endpoint and clears all authentication data
 */
export async function logout(): Promise<void> {
  try {
    // Try to call logout endpoint if token exists
    const token = getToken();
    if (token) {
      try {
        await authenticatedFetch(getApiUrl('/v1/users/logout'), {
          method: 'POST',
        });
      } catch (error) {
        // Even if logout endpoint fails, continue with cleanup
        // This handles cases where token is already invalid
        console.warn('Logout endpoint call failed, continuing with cleanup:', error);
      }
    }
  } catch (error) {
    // Continue with cleanup even if API call fails
    console.warn('Error during logout API call:', error);
  }
}

/**
 * Auth API object for convenience
 */
export const authAPI = {
  login,
  forgotPassword,
  resetPassword,
  resendOTP,
  logout,
};

