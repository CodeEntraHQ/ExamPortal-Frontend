import { authenticatedFetch, getApiUrl } from './core';

const generate2FA = async () => {
  const response = await authenticatedFetch(getApiUrl('/v1/users/two-fa/generate'), {
    method: 'GET',
  });
  return response.json();
};

const toggle2FA = async (mode: 'ENABLE' | 'DISABLE', code: string) => {
  const body: { mode: string; authentication_code: string;} = {
    mode,
    authentication_code: code,
  };

  const response = await authenticatedFetch(getApiUrl('/v1/users/two-fa/toggle'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
};

export const twoFactorAPI = {
  generate2FA,
  enable2FA: (otp: string) => toggle2FA('ENABLE', otp),
  disable2FA: (otp: string) => toggle2FA('DISABLE', otp),
};
