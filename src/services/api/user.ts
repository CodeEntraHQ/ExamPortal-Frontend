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

export interface ApiUser {
  id: string;
  name: string | null;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE' | 'ACTIVATION_PENDING';
  entity_id?: string;
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

export interface GetUsersResponse {
  payload: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    users: ApiUser[];
  };
}

export interface InviteUserPayload {
  email: string;
  role: 'ADMIN' | 'STUDENT';
  entity_id?: string;
}

export interface InviteUserResponse {
  payload: {
    id: string;
    role: 'ADMIN' | 'STUDENT';
  };
}

export interface CreateUserPayload {
  email: string;
  name?: string;
  role: 'ADMIN' | 'STUDENT';
  entity_id?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  gender?: 'MALE' | 'FEMALE';
  roll_number?: string;
}

export interface CreateUserResponse {
  payload: {
    id: string;
    email: string;
    role: 'ADMIN' | 'STUDENT';
    password: string; // Random password generated
  };
}

/**
 * Get users with pagination and filters
 */
export async function getUsers(
  params?: {
    entity_id?: string;
    role?: 'ADMIN' | 'STUDENT';
    page?: number;
    limit?: number;
  }
): Promise<GetUsersResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.entity_id) {
    queryParams.append('entity_id', params.entity_id);
  }
  if (params?.role) {
    queryParams.append('role', params.role);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const url = `/v1/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await authenticatedFetch(getApiUrl(url), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Invite a new user
 */
export async function inviteUser(payload: InviteUserPayload): Promise<InviteUserResponse> {
  const response = await authenticatedFetch(getApiUrl('/v1/users/invite'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Create a new user directly with random password
 */
export async function createUser(payload: CreateUserPayload): Promise<CreateUserResponse> {
  const response = await authenticatedFetch(getApiUrl('/v1/users/create'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Deregister (deactivate) a user
 */
export async function deregisterUser(userId?: string): Promise<void> {
  const response = await authenticatedFetch(getApiUrl('/v1/users/deregister'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userId ? { user_id: userId } : {}),
  });

  await response.json();
}

/**
 * Activate a user directly (without invitation)
 * Directly updates user status to ACTIVE
 */
export async function activateUser(userId: string): Promise<void> {
  const response = await authenticatedFetch(getApiUrl('/v1/users/activate'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });

  await response.json();
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

