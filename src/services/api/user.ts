/**
 * User API service
 * Handles user profile and account operations
 */

import { authenticatedFetch, getApiUrl } from './core';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'STUDENT';
  entityId?: string;
  entityName?: string;
  profile_picture_link?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  created_at?: string;
  gender?: string;
  roll_number?: string;
  last_login_at?: string;
  two_fa_enabled?: boolean;
}

/**
 * Update user profile
 */
export async function updateUserProfile(formData: FormData): Promise<{ payload: UserProfile }> {
  const response = await authenticatedFetch(getApiUrl('/v1/users'), {
    method: 'PATCH',
    body: formData,
  });

  return response.json();
}

/**
 * Change password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await authenticatedFetch(getApiUrl('/v1/users/password/change'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  await response.json();
}

