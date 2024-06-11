import type { GoogleApis } from 'npm:googleapis@140.0.0';

let googleApis: GoogleApis | undefined;

export const getGoogleApis = async () => {
  if (googleApis) {
    return googleApis;
  }
  const { google } = await import('npm:googleapis@140.0.0');
  googleApis = google;
  return googleApis;
};
