import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Club Management System API running on port ${env.PORT} [${env.NODE_ENV}]`);
});
