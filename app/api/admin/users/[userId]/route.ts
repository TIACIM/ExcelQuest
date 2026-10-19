import { dbQuery } from '@/db';
import { assertSameOrigin, isRole, writeAudit } from '@/lib/auth';
import { apiUser, forbidden, isSuperadmin, unauthorized } from '@/lib/api';

export const runtime = 'nodejs';
type Context = { params: Promise<{ userId: string }> };

async function actorFor(request: Request) {
  const actor = await apiUser();
  if (!actor) return { response: unauthorized() };
  if (!isSuperadmin(actor)) return { response: forbidden() };
  try { assertSameOrigin(request); } catch { return { response: Response.json({ error: 'Origem da solicitação inválida.' }, { status: 403 }) }; }
  return { actor };
}

export async function PATCH(request: Request, context: Context) {
  const auth = await actorFor(request); if ('response' in auth) return auth.response;
  const { userId } = await context.params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: 'Dados inválidos.' }, { status: 400 }); }
  const active = body.active;
  const role = body.role;
  if ((active !== undefined && typeof active !== 'boolean') || (role !== undefined && !isRole(role)) || (active === undefined && role === undefined)) return Response.json({ error: 'Alteração de usuário inválida.' }, { status: 400 });
  if (userId === auth.actor.id && active === false) return Response.json({ error: 'Você não pode desativar sua própria conta.' }, { status: 400 });
  try {
    if (active === false) {
      const targetRows = await dbQuery('SELECT role FROM users WHERE id = $1 LIMIT 1', [userId]);
      if ((targetRows[0] as Record<string, unknown> | undefined)?.role === 'superadmin') {
        const countRows = await dbQuery("SELECT COUNT(*)::int AS total FROM users WHERE role = 'superadmin' AND active = TRUE");
        if (Number((countRows[0] as Record<string, unknown>).total) <= 1) return Response.json({ error: 'Mantenha ao menos um superadministrador ativo.' }, { status: 400 });
      }
    }
    const rows = await dbQuery(`UPDATE users SET role = COALESCE($1, role), active = COALESCE($2, active), updated_at = NOW()
      WHERE id = $3 RETURNING id, username, role, active, must_change_password, created_at, updated_at`, [role ?? null, active ?? null, userId]);
    if (!rows[0]) return Response.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    if (active === false) await dbQuery('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
    await writeAudit(auth.actor.id, 'user.updated', 'user', userId, { ...(role ? { role } : {}), ...(active !== undefined ? { active } : {}) });
    return Response.json({ user: rows[0] });
  } catch { return Response.json({ error: 'Não foi possível atualizar o usuário agora.' }, { status: 503 }); }
}

export async function DELETE(request: Request, context: Context) {
  const auth = await actorFor(request); if ('response' in auth) return auth.response;
  const { userId } = await context.params;
  if (userId === auth.actor.id) return Response.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 400 });
  try {
    const targetRows = await dbQuery('SELECT role FROM users WHERE id = $1 LIMIT 1', [userId]);
    const target = targetRows[0] as Record<string, unknown> | undefined;
    if (!target) return Response.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    if (target.role === 'superadmin') {
      const countRows = await dbQuery("SELECT COUNT(*)::int AS total FROM users WHERE role = 'superadmin' AND active = TRUE");
      if (Number((countRows[0] as Record<string, unknown>).total) <= 1) return Response.json({ error: 'Mantenha ao menos um superadministrador ativo.' }, { status: 400 });
    }
    await dbQuery('UPDATE users SET active = FALSE, updated_at = NOW() WHERE id = $1', [userId]);
    await dbQuery('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
    await writeAudit(auth.actor.id, 'user.deactivated', 'user', userId);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: 'Não foi possível desativar o usuário agora.' }, { status: 503 }); }
}
