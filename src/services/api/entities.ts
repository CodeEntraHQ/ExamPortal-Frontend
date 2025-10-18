import { authenticatedFetch, getApiUrl } from './index';

export interface Entity {
  id: string;
  name: string;
  address: string;
  type: 'COLLEGE' | 'SCHOOL';
  total_students: number;
  total_exams: number;
  created_at: string;
  description?: string;
  email?: string;
  phone_number?: string;
  logo_link?: string;
  status: string;
}

export interface GetEntitiesResponse {
  status: string;
  responseCode: string;
  payload: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    entities: Entity[];
  };
}

export interface CreateEntityPayload {
  name: string;
  address: string;
  type: 'COLLEGE' | 'SCHOOL';
}

export interface UpdateEntityPayload {
  entity_id: string;
  type: 'COLLEGE' | 'SCHOOL';
}

export const getEntities = async (page = 1): Promise<GetEntitiesResponse> => {
  const response = await authenticatedFetch(getApiUrl(`/entities?page=${page}`), {
    method: 'GET',
  });
  return response.json();
};

export const createEntity = async (data: CreateEntityPayload): Promise<any> => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, (data as any)[key]);
  });

  const response = await authenticatedFetch(getApiUrl('/entities'), {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

export const updateEntity = async (data: UpdateEntityPayload): Promise<any> => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, (data as any)[key]);
  });

  const response = await authenticatedFetch(getApiUrl('/entities'), {
    method: 'PATCH',
    body: formData,
  });
  const responseData = await response.json();
  if (responseData.status === 'SUCCESS') {
    return responseData.payload;
  } else {
    throw new Error(responseData.responseCode || 'Failed to update entity');
  }
};
