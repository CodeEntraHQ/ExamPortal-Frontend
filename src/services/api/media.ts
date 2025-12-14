import { authenticatedFetch, getApiUrl } from './core';

export interface CreateMediaResponse {
  id: string;
}

/**
 * Upload an image Blob (snapshot) to backend /v1/medias
 * Expects a FormData with field `file` containing the Blob
 */
export async function uploadMedia(blob: Blob): Promise<CreateMediaResponse> {
  const fd = new FormData();
  fd.append('file', blob, 'snapshot.jpg');

  const res = await authenticatedFetch(getApiUrl('/v1/medias'), {
    method: 'POST',
    body: fd,
  });

  return res.json();
}
