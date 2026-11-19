// Pripravi prazno podatkovno bazo: če tabele še ne obstajajo, izvede skripte iz mape db/
// (shema, testni podatki in sprožilec), enako kot Docker ob lokalnem zagonu.
// Uporablja se ob zagonu v produkciji, zato je varno, da se izvede večkrat.
import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const dbDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'db');

try {
  const obstaja = await pool.query("SELECT to_regclass('public.uporabnik') AS tabela");
  if (obstaja.rows[0].tabela) {
    console.log('Baza je že pripravljena.');
  } else {
    const skripte = (await readdir(dbDir)).filter((ime) => ime.endsWith('.sql')).sort();
    for (const ime of skripte) {
      await pool.query(await readFile(path.join(dbDir, ime), 'utf8'));
      console.log(`Izvedena skripta ${ime}`);
    }
  }
} finally {
  await pool.end();
}
