import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import recipesRouter from './routes/recipes.routes.js';
import authRouter from './routes/auth.routes.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/recipes', recipesRouter);
app.use('/auth', authRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default app;

