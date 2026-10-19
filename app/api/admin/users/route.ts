import { randomUUID } from 'node:crypto';
import { dbQuery, type Role } from '@/db';
import { assertSameOrigin, hashPassword, isRole, writeAudit } from '@/lib/auth';
import { apiUser, forbidden, isSuperadmin, unauthorized } from '@/lib/api';

export const runtime = 'nodejs';
const roles: Role[] = ['superadmin', 'admin', 'manager', 'collaborator'];

export async function GET() {
  const actor = await apiUser();
  if (!actor) return unauthorized();
  if (!isSuperadmin(actor)) return forbidden();
  try {
    const rows = await dbQuery(`SELECT id, username, role, active, must_change_password, created_at, updated_at
      FROM users ORDER BY created_at ASC`);
    return Response.json({ users: rows });
  } catch { return Response.json({ error: 'Não foi possível carregar os usuários agora.' }, { status: 503 }); }
}

export async function POST(request: Request) {
  const actor = await apiUser();
  if (!actor) return unauthorized();
  if (!isSuperadmin(actor)) return forbidden();
  try { assertSameOrigin(request); } catch { return Response.json({ error: 'Origem da solicitação inválida.' }, { status: 403 }); }
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: 'Dados inválidos.' }, { status: 400 }); }
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = body.password;
  const role = body.role;
  if (username.length < 2 || username.length > 64 || typeof password !== 'string' || password.length < 12 || password.length > 256 || !isRole(role)) {
    return Response.json({ error: 'Revise usuário, senha (mínimo de 12 caracteres) e perfil.' }, { status: 400 });
  }
  try {
    const rows = await dbQuery(`INSERT INTO users (id, username, password_hash, role, active, must_change_password)
      VALUES ($1, $2, $3, $4, TRUE, TRUE)
      ON CONFLICT DO NOTHING RETURNING id, username, role, active, must_change_password, created_at`, [randomUUID(), username, await hashPassword(password), role]);
    if (!rows[0]) return Response.json({ error: 'Esse nome de usuário já está em uso.' }, { status: 409 });
    const created = rows[0] as Record<string, unknown>;
    await writeAudit(actor.id, 'user.created', 'user', String(created.id), { role });
    return Response.json({ user: created }, { status: 201 });
  } catch { return Response.json({ error: 'Não foi possível criar o usuário agora.' }, { status: 503 }); }
}

export { roles };
