import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import membersRoutes from './modules/members/members.routes';
import financeRoutes from './modules/finance/finance.routes';
import eventsRoutes from './modules/events/events.routes';
import communicationRoutes from './modules/communication/communication.routes';
import reportingRoutes from './modules/reporting/reporting.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Basic rate limiting on auth endpoints to slow brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/reporting', reportingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
