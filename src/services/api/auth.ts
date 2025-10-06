import { getApiUrl, storeToken } from './index';

/**
 * Logs in a user and stores the authentication token.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user data from the payload.
 * @throws An error if the login fails.
 */
export const login = async (email, password) => {
  const response = await fetch(getApiUrl('/users/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ responseMessage: 'Network response was not ok' }));
    throw new Error(errorData.responseMessage || errorData.message || 'Login failed');
  }

  const data = await response.json();

  if (data.status === 'SUCCESS' && data.payload && data.payload.token) {
    storeToken(data.payload.token);
    return data.payload.user;
  } else {
    throw new Error(data.responseCode || 'Login failed: Invalid response structure');
  }
};

/**
 * Initiates the password reset process for a user.
 * @param email The user's email.
 * @throws An error if the request fails.
 */
export const forgotPassword = async (email: string) => {
  const response = await fetch(getApiUrl('/users/password/forgot'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ responseMessage: 'An error occurred' }));
    throw new Error(errorData.responseMessage || 'Failed to initiate password reset');
  }

  return response.json();
};

/**
 * Resets the user's password using a reset token.
 * @param password The new password.
 * @param token The password reset token.
 * @throws An error if the request fails.
 */
export const resetPassword = async (password: string, token: string) => {
  const response = await fetch(getApiUrl(`/users/password/reset`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ responseMessage: 'An error occurred' }));
    throw new Error(errorData.responseMessage || 'Failed to reset password');
  }

  return response.json();
};
