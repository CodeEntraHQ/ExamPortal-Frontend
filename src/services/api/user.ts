import { authenticatedFetch, getApiUrl } from './index';

export const updateUserProfile = async (formData: FormData) => {
  try {
    const response = await authenticatedFetch(getApiUrl('/users'), {
      method: 'PATCH',
      body: formData,
    });
    return await response.json();
  } catch (error: any) {
    try {
      // The error from authenticatedFetch should be a JSON string.
      const errorData = JSON.parse(error.message);
      throw new Error(errorData.responseMessage || 'An unexpected error occurred.');
    } catch (e) {
      // If parsing fails, it might be a network error or a non-JSON response.
      throw new Error(error.message || 'An unexpected network error occurred.');
    }
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await authenticatedFetch(getApiUrl('/users/password/change'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return await response.json();
  } catch (error: any) {
    try {
      const errorData = JSON.parse(error.message);
      throw new Error(errorData.responseMessage || 'An unexpected error occurred.');
    } catch (e) {
      throw new Error(error.message || 'An unexpected network error occurred.');
    }
  }
};
