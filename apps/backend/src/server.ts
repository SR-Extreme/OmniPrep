import 'dotenv/config';
import { env } from './config/env.js';
import app from './app.js';

const PORT = Number(process.env.PORT) || 4000;

app.listen(env.PORT, () => {
    console.log(`OmniPrep API running on http://localhost:${env.PORT}`);
    console.log(`Health check: http://localhost:${env.PORT}/health`);
    console.log(`Auth API: http://localhost:${env.PORT}/api/auth`);
});