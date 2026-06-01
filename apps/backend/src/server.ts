import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
    console.log(`OmniPrep API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});