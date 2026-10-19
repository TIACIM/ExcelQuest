import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

const [exportPath, mappingPath] = process.argv.slice(2);
if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL antes da importação.');
if (!exportPath || !mappingPath) throw new Error('Uso: node scripts/import-d1-progress.mjs <progresso-d1.json> <mapa-usuario.json>');
const exportData = JSON.parse(await readFile(exportPath, 'utf8'));
const mapping = JSON.parse(await readFile(mappingPath, 'utf8'));
const rows = Array.isArray(exportData) ? exportData : exportData.rows;
if (!Array.isArray(rows) || !mapping || typeof mapping !== 'object' || Array.isArray(mapping)) throw new Error('Os arquivos de exportação ou mapa de usuários não têm o formato esperado.');
const sql = neon(process.env.DATABASE_URL);
let imported = 0;
let skipped = 0;
for (const row of rows) {
  if (!row || typeof row !== 'object') { skipped++; continue; }
  const oldId = row.user_id;
  const username = typeof oldId === 'string' ? mapping[oldId] : undefined;
  if (typeof username !== 'string') { skipped++; continue; }
  let payload = row.payload;
  try { if (typeof payload === 'string') payload = JSON.parse(payload); } catch { skipped++; continue; }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) { skipped++; continue; }
  const users = await sql.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1', [username]);
  const userId = users[0]?.id;
  if (!userId) { skipped++; continue; }
  const inserted = await sql.query(`INSERT INTO user_progress (user_id, payload, updated_at)
    VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (user_id) DO NOTHING RETURNING user_id`, [userId, JSON.stringify(payload)]);
  if (inserted.length) imported++; else skipped++;
}
console.log(`Importação concluída: ${imported} progresso(s) inserido(s), ${skipped} ignorado(s).`);
