import dotenv from 'dotenv';

export interface EnvConfig {
  mode: string;
  accessTokenSecret: string;
  refreshedTokenSecret: string;

  email: {
    sendgridApiKey: string;
    emailSender: string;
  };
}
export const envConfig = (): EnvConfig => {
  const mode = process.env.NODE_ENV;
  if (!mode || mode === 'development') {
    dotenv.config();
  } else {
    dotenv.config({ path: `.env.${mode}` });
  }

  return {
    mode,
    accessTokenSecret:
      process.env.ACCESS_TOKEN_SECRET || `some-very-strong-secret`,
    refreshedTokenSecret:
      process.env.REFRESHED_TOKEN_SECRET || `some-very-strong-secret`,
    email: {
      sendgridApiKey: process.env.SENDGRID_API_KEY,
      emailSender: process.env.SENDGRID_EMAIL || 'your-email@yopmail.com',
    },
  };
};
