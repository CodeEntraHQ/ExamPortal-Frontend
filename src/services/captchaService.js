import apiService from './api';

export const getCaptcha = async () => {
  try {
    const response = await apiService.requestPublic('/v1/users/captcha');

    if (response && response.payload) {
      // The response should contain the captcha image data and the token for the login request
      return {
        captchaData: response.payload.captcha,
        captchaToken: response.payload.token,
      };
    } else {
      console.error('Unexpected captcha response structure:', response);
      throw new Error('Failed to retrieve captcha data.');
    }
  } catch (error) {
    console.error('Error fetching captcha:', error);
    throw error;
  }
};
