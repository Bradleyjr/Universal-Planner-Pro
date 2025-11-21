import dotenv from 'dotenv';

dotenv.config();

const defaultPort = 4000;

export const env = {
  port: Number.parseInt(process.env.PORT ?? `${defaultPort}`, 10) || defaultPort,
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
