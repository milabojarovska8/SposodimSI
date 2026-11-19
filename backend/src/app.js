import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import opremaRouter from './routes/oprema.js';
import izposojeRouter from './routes/izposoje.js';
import { niNajdeno, obdelajNapako } from './napake.js';

const app = express();
const PgStore = connectPgSimple(session);

// V produkciji teče aplikacija za posrednikom gostitelja (HTTPS), zato zaupamo njegovim glavam
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json());

app.use(
  session({
    store: new PgStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'samo-za-razvoj',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8, // 8 ur
    },
  })
);

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/oprema', opremaRouter);
app.use('/api/izposoje', izposojeRouter);

// ADR 0003: v produkciji Express streže zgrajeni frontend na istem naslovu kot API.
// Mapo nastavi FRONTEND_DIR, privzeto je backend/public (tja jo prestavi CI/CD).
const frontendDir =
  process.env.FRONTEND_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

if (existsSync(path.join(frontendDir, 'index.html'))) {
  app.use(express.static(frontendDir));
  // Vse ostale GET zahteve, ki niso API, vrnejo index.html, da poti Vue Routerja delujejo ob osvežitvi
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDir, 'index.html'));
  });
}

app.use(niNajdeno);
app.use(obdelajNapako);

export default app;