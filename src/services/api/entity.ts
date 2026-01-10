/**
 * Entity API service
 * Handles entity-related operations
 */

import { authenticatedFetch, getApiUrl } from './core';

export interface ApiEntity {
  id: string;
  name: string;
  address?: string;
  description?: string;
  email?: string;
  phone_number?: string;
  type?: string;
  logo_link?: string;
  signature_link?: string;
  created_at?: string;
  total_exams?: number;
  total_students?: number;
  monitoring_enabled?: boolean;
  subscription_end_date?: string | null;
}

export interface CreateEntityPayload {
  name: string;
  address?: string;
  description?: string;
  email?: string;
  phone_number?: string;
  type?: string;
  subscription_years?: number;
  subscription_months?: number;
  subscription_days?: number;
}

export interface UpdateEntityPayload {
  entity_id: string;
  name?: string;
  address?: string;
  description?: string;
  email?: string;
  phone_number?: string;
  type?: string;
  monitoring_enabled?: boolean;
  subscription_years?: number;
  subscription_months?: number;
  subscription_days?: number;
}

export interface GetEntitiesResponse {
  payload: {
    entities: ApiEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Get entities with pagination
 */
export async function getEntities(
  page: number = 1,
  limit: number = 10
): Promise<GetEntitiesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await authenticatedFetch(getApiUrl(`/v1/entities?${params.toString()}`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get a single entity by ID
 * Allows ADMIN users to get their own entity, SUPERADMIN can get any entity
 */
export async function getEntityById(entityId: string): Promise<{ payload: ApiEntity }> {
  const response = await authenticatedFetch(getApiUrl(`/v1/entities/${entityId}`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Create a trial entity with admin user (public endpoint, no auth required)
 */
export async function createTrialEntity(payload: CreateEntityPayload & { admin_email: string } | FormData): Promise<{ payload: { entity_id: string; entity_name: string; admin_id: string; admin_email: string; invitation_token: string; subscription_end_date: string } }> {
  let formData: FormData;
  const isFormData = payload instanceof FormData;
  
  if (!isFormData && payload && typeof payload === 'object') {
    const regularPayload = payload as any;
    formData = new FormData();
    
    if (regularPayload.name) formData.append('name', regularPayload.name);
    if (regularPayload.address) formData.append('address', regularPayload.address);
    if (regularPayload.description) formData.append('description', regularPayload.description);
    if (regularPayload.email) formData.append('email', regularPayload.email);
    if (regularPayload.phone_number) {
      const phoneStr = String(regularPayload.phone_number).replace(/\D/g, '');
      const phoneNum = parseInt(phoneStr, 10);
      if (phoneStr.length > 0 && phoneNum >= 6000000000 && phoneNum <= 9999999999) {
        formData.append('phone_number', phoneStr);
      }
    }
    if (regularPayload.type) formData.append('type', regularPayload.type);
    if (regularPayload.logo) formData.append('logo', regularPayload.logo);
    if (regularPayload.admin_email) formData.append('admin_email', regularPayload.admin_email);
  } else {
    formData = payload as FormData;
  }
  
  // Use regular fetch instead of authenticatedFetch for public endpoint
  const response = await fetch(getApiUrl('/v1/entities/trial'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.responseMessage || errorData.message || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Create an entity
 */
export async function createEntity(payload: CreateEntityPayload | FormData): Promise<{ payload: ApiEntity }> {
  let formData: FormData | undefined;
  let isFormData = payload instanceof FormData;
  
  // If payload is not FormData but has a logo file, convert to FormData
  if (!isFormData && payload && typeof payload === 'object' && 'logo' in payload && payload.logo instanceof File) {
    formData = new FormData();
    const regularPayload = payload as any;
    
    // Add all fields to FormData
    if (regularPayload.name) formData.append('name', regularPayload.name);
    if (regularPayload.address) formData.append('address', regularPayload.address);
    if (regularPayload.description) formData.append('description', regularPayload.description);
    if (regularPayload.email) formData.append('email', regularPayload.email);
    if (regularPayload.phone_number) {
      const phoneStr = String(regularPayload.phone_number).replace(/\D/g, '');
      const phoneNum = parseInt(phoneStr, 10);
      // Backend validation requires phone_number to be between 6000000000 and 9999999999
      if (phoneStr.length > 0 && phoneNum >= 6000000000 && phoneNum <= 9999999999) {
        formData.append('phone_number', phoneStr);
      }
    }
    if (regularPayload.type) formData.append('type', regularPayload.type);
    if (regularPayload.logo) formData.append('logo', regularPayload.logo);
    if (regularPayload.subscription_years !== undefined) formData.append('subscription_years', String(regularPayload.subscription_years));
    if (regularPayload.subscription_months !== undefined) formData.append('subscription_months', String(regularPayload.subscription_months));
    if (regularPayload.subscription_days !== undefined) formData.append('subscription_days', String(regularPayload.subscription_days));
    
    isFormData = true;
  } else if (isFormData) {
    formData = payload as FormData;
  }
  
  const response = await authenticatedFetch(getApiUrl('/v1/entities'), {
    method: 'POST',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body: isFormData && formData ? formData : JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Update an entity
 */
export async function updateEntity(payload: UpdateEntityPayload | FormData): Promise<{ payload: ApiEntity }> {
  let formData: FormData;
  let isFormData = payload instanceof FormData;
  
  // Backend uses multer middleware which expects FormData
  // Always convert to FormData to ensure compatibility
  if (!isFormData && payload && typeof payload === 'object') {
    const regularPayload = payload as any;
    
    formData = new FormData();
    
    // Add all fields to FormData (only include defined fields to avoid validation errors)
    if (regularPayload.entity_id) {
      formData.append('entity_id', regularPayload.entity_id);
    }
    // Name is required, always include if provided
    if (regularPayload.name !== undefined && regularPayload.name !== null && regularPayload.name !== '') {
      formData.append('name', String(regularPayload.name));
    }
    // Address is optional but can be empty
    if (regularPayload.address !== undefined && regularPayload.address !== null) {
      formData.append('address', String(regularPayload.address));
    }
    // Description is optional and can be empty string
    if (regularPayload.description !== undefined && regularPayload.description !== null) {
      formData.append('description', String(regularPayload.description));
    }
    // Email is optional and can be empty string
    if (regularPayload.email !== undefined && regularPayload.email !== null) {
      formData.append('email', String(regularPayload.email));
    }
    if (regularPayload.phone_number !== undefined && regularPayload.phone_number !== null && regularPayload.phone_number !== '') {
      // Convert to string for FormData, backend will parse it
      const phoneStr = String(regularPayload.phone_number);
      // Remove any non-digit characters
      const phoneDigits = phoneStr.replace(/\D/g, '');
      // Backend validation requires phone_number to be between 6000000000 and 9999999999
      const phoneNum = parseInt(phoneDigits, 10);
      if (phoneDigits.length > 0 && phoneNum >= 6000000000 && phoneNum <= 9999999999) {
        formData.append('phone_number', phoneDigits);
      }
    }
    if (regularPayload.type !== undefined && regularPayload.type !== null && regularPayload.type !== '') {
      formData.append('type', String(regularPayload.type));
    }
    if (regularPayload.monitoring_enabled !== undefined && regularPayload.monitoring_enabled !== null) {
      formData.append('monitoring_enabled', String(regularPayload.monitoring_enabled));
    }
    if (regularPayload.subscription_years !== undefined && regularPayload.subscription_years !== null) {
      formData.append('subscription_years', String(regularPayload.subscription_years));
    }
    if (regularPayload.subscription_months !== undefined && regularPayload.subscription_months !== null) {
      formData.append('subscription_months', String(regularPayload.subscription_months));
    }
    if (regularPayload.subscription_days !== undefined && regularPayload.subscription_days !== null) {
      formData.append('subscription_days', String(regularPayload.subscription_days));
    }
    // Only append logo if it's a File object
    if (regularPayload.logo && regularPayload.logo instanceof File) {
      formData.append('logo', regularPayload.logo);
    }
    if (regularPayload.signature && regularPayload.signature instanceof File) {
      formData.append('signature', regularPayload.signature);
    }
    
    isFormData = true;
  } else if (isFormData) {
    formData = payload as FormData;
  } else {
    formData = new FormData();
    const jsonPayload = payload as any;
    if (jsonPayload.entity_id) formData.append('entity_id', jsonPayload.entity_id);
    if (jsonPayload.name) formData.append('name', String(jsonPayload.name));
    if (jsonPayload.address) formData.append('address', String(jsonPayload.address));
    if (jsonPayload.description) formData.append('description', String(jsonPayload.description));
    if (jsonPayload.email) formData.append('email', String(jsonPayload.email));
    if (jsonPayload.phone_number) {
      const phoneStr = String(jsonPayload.phone_number).replace(/\D/g, '');
      const phoneNum = parseInt(phoneStr, 10);
      // Backend validation requires phone_number to be between 6000000000 and 9999999999
      if (phoneStr.length > 0 && phoneNum >= 6000000000 && phoneNum <= 9999999999) {
        formData.append('phone_number', phoneStr);
      }
    }
    if (jsonPayload.type) formData.append('type', String(jsonPayload.type));
    if (jsonPayload.monitoring_enabled !== undefined && jsonPayload.monitoring_enabled !== null) {
      formData.append('monitoring_enabled', String(jsonPayload.monitoring_enabled));
    }
    if (jsonPayload.subscription_years !== undefined) formData.append('subscription_years', String(jsonPayload.subscription_years));
    if (jsonPayload.subscription_months !== undefined) formData.append('subscription_months', String(jsonPayload.subscription_months));
    if (jsonPayload.subscription_days !== undefined) formData.append('subscription_days', String(jsonPayload.subscription_days));
    if (jsonPayload.logo && jsonPayload.logo instanceof File) {
      formData.append('logo', jsonPayload.logo);
    }
    if (jsonPayload.signature && jsonPayload.signature instanceof File) {
      formData.append('signature', jsonPayload.signature);
    }
    isFormData = true;
  }
  
  try {
    const response = await authenticatedFetch(getApiUrl('/v1/entities'), {
      method: 'PATCH',
      headers: {}, // Don't set Content-Type for FormData, browser will set it with boundary
      body: formData,
    });

    // authenticatedFetch already throws if !response.ok, so we can safely parse JSON
    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.payload) {
      console.warn('⚠️ updateEntity - Unexpected response structure:', data);
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ updateEntity - Error:', error);
    console.error('❌ updateEntity - Error message:', error.message);
    console.error('❌ updateEntity - Error stack:', error.stack);
    throw error;
  }
}

/**
 * Delete an entity
 * Only SUPERADMIN can delete entities
 */
export async function deleteEntity(entityId: string): Promise<{ payload: { message: string } }> {
  const response = await authenticatedFetch(getApiUrl(`/v1/entities/${entityId}`), {
    method: 'DELETE',
  });

  return response.json();
}
