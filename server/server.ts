import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';

const app = express();

const corsOptions={
    origin: process.env.TRUSTED_ORIGINS?.split(",") || [],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}

app.use(cors(corsOptions))

app.use(express.json({limit:'50mb'}));

app.all('/api/auth/{*any}', toNodeHandler(auth));

const port = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});