import cors from 'cors';
import express, { ErrorRequestHandler } from 'express';
import path from 'path';
import { env } from './config/env';
import apiRouter from './routes/api';
import healthRouter from './routes/health';

const app = express();

app.use(cors());
app.use(express.json());

const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

app.use('/api', apiRouter);
app.use('/health', healthRouter);

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: `Path not found: ${req.path}` });
  }
  return next();
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
});
