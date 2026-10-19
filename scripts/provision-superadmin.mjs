import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const { DATABASE_URL, INITIAL_SUPERADMIN_PASSWORD } = process.env;
const username = process.env.INITIAL_SUPERADMIN_USERNAME || 'TI';
if (!DATABASE_URL) throw new Error('Defina DATABASE_URL antes do provisionamento.');
if (!INITIAL_SUPERADMIN_PASSWORD) throw new Error('Defina INITIAL_SUPERADMIN_PASSWORD apenas no ambiente seguro de provisionamento.');
if (INITIAL_SUPERADMIN_PASSWORD.length < 12) throw new Error('A senha inicial deve ter pelo menos 12 caracteres.');
const sql = neon(DATABASE_URL);
const passwordHash = await bcrypt.hash(INITIAL_SUPERADMIN_PASSWORD, 12);
const inserted = await sql.query(`INSERT INTO users (id, username, password_hash, role, active, must_change_password)
  VALUES ($1, $2, $3, 'superadmin', TRUE, TRUE)
  ON CONFLICT DO NOTHING
  RETURNING id`, [randomUUID(), username, passwordHash]);
console.log(inserted.length ? `Superadministrador ${username} provisionado.` : `Superadministrador ${username} já existe; nenhuma credencial foi alterada.`);
