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
  created_at?: string;
  total_exams?: number;
  total_students?: number;
}

export interface CreateEntityPayload {
  name: string;
  address?: string;
  description?: string;
  email?: string;
  phone_number?: string;
  type?: string;
}

export interface UpdateEntityPayload {
  entity_id: string;
  name?: string;
  address?: string;
  description?: string;
  email?: string;
  phone_number?: string;
  type?: string;
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
  console.log('🔵 updateEntity - Received payload:', payload);
  console.log('🔵 updateEntity - Payload type:', payload instanceof FormData ? 'FormData' : typeof payload);
  
  let formData: FormData;
  let isFormData = payload instanceof FormData;
  
  // Backend uses multer middleware which expects FormData
  // Always convert to FormData to ensure compatibility
  if (!isFormData && payload && typeof payload === 'object') {
    const regularPayload = payload as any;
    console.log('🔵 updateEntity - Converting object to FormData');
    console.log('🔵 updateEntity - Original payload keys:', Object.keys(regularPayload));
    console.log('🔵 updateEntity - Original payload values:', {
      entity_id: regularPayload.entity_id,
      name: regularPayload.name,
      address: regularPayload.address,
      description: regularPayload.description,
      email: regularPayload.email,
      phone_number: regularPayload.phone_number,
      type: regularPayload.type,
      hasLogo: !!regularPayload.logo,
      logoType: regularPayload.logo ? typeof regularPayload.logo : 'none'
    });
    
    formData = new FormData();
    
    // Add all fields to FormData (only include defined fields to avoid validation errors)
    if (regularPayload.entity_id) {
      formData.append('entity_id', regularPayload.entity_id);
      console.log('✅ Added entity_id:', regularPayload.entity_id);
    }
    // Name is required, always include if provided
    if (regularPayload.name !== undefined && regularPayload.name !== null && regularPayload.name !== '') {
      formData.append('name', String(regularPayload.name));
      console.log('✅ Added name:', regularPayload.name);
    }
    // Address is optional but can be empty
    if (regularPayload.address !== undefined && regularPayload.address !== null) {
      formData.append('address', String(regularPayload.address));
      console.log('✅ Added address:', regularPayload.address);
    }
    // Description is optional and can be empty string
    if (regularPayload.description !== undefined && regularPayload.description !== null) {
      formData.append('description', String(regularPayload.description));
      console.log('✅ Added description:', regularPayload.description);
    }
    // Email is optional and can be empty string
    if (regularPayload.email !== undefined && regularPayload.email !== null) {
      formData.append('email', String(regularPayload.email));
      console.log('✅ Added email:', regularPayload.email);
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
        console.log('✅ Added phone_number:', phoneDigits, '(original:', regularPayload.phone_number, ')');
      } else {
        console.log('⚠️ Skipped phone_number - invalid format or out of range:', regularPayload.phone_number, '(must be between 6000000000 and 9999999999)');
      }
    }
    if (regularPayload.type !== undefined && regularPayload.type !== null && regularPayload.type !== '') {
      formData.append('type', String(regularPayload.type));
      console.log('✅ Added type:', regularPayload.type);
    }
    // Only append logo if it's a File object
    if (regularPayload.logo && regularPayload.logo instanceof File) {
      formData.append('logo', regularPayload.logo);
      console.log('✅ Added logo file:', regularPayload.logo.name, regularPayload.logo.size, 'bytes');
    } else if (regularPayload.logo) {
      console.log('⚠️ Skipped logo - not a File object:', typeof regularPayload.logo);
    }
    
    // Log all FormData entries
    console.log('🔵 updateEntity - FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }
    
    isFormData = true;
  } else if (isFormData) {
    console.log('🔵 updateEntity - Payload is already FormData');
    formData = payload as FormData;
  } else {
    console.log('🔵 updateEntity - Fallback: converting to FormData');
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
    if (jsonPayload.logo && jsonPayload.logo instanceof File) {
      formData.append('logo', jsonPayload.logo);
    }
    isFormData = true;
  }
  
  console.log('🔵 updateEntity - Sending request to:', getApiUrl('/v1/entities'));
  console.log('🔵 updateEntity - Method: PATCH');
  console.log('🔵 updateEntity - Using FormData:', isFormData);
  
  try {
    const response = await authenticatedFetch(getApiUrl('/v1/entities'), {
      method: 'PATCH',
      headers: {}, // Don't set Content-Type for FormData, browser will set it with boundary
      body: formData,
    });

    // authenticatedFetch already throws if !response.ok, so we can safely parse JSON
    const data = await response.json();
    console.log('✅ updateEntity - Success response:', data);
    
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

