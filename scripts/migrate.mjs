import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL antes de executar a migração.');
const sql = neon(process.env.DATABASE_URL);
const id = '0001_auth_and_progress';
await sql.query('CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
const applied = await sql.query('SELECT id FROM schema_migrations WHERE id = $1', [id]);
if (applied.length) {
  console.log(`Migração ${id} já foi aplicada.`);
} else {
  const source = await readFile(resolve('db/migrations/0001_auth_and_progress.sql'), 'utf8');
  for (const statement of source.split(';').map((part) => part.trim()).filter(Boolean)) await sql.query(statement);
  await sql.query('INSERT INTO schema_migrations (id) VALUES ($1)', [id]);
  console.log(`Migração ${id} aplicada.`);
}
