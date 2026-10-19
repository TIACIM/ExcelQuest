import { assertSameOrigin, hashPassword, revokeCurrentSession, verifyPassword, writeAudit } from '@/lib/auth';
import { dbQuery } from '@/db';
import { apiUser, unauthorized } from '@/lib/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return unauthorized();
  try { assertSameOrigin(request); } catch { return Response.json({ error: 'Origem da solicitação inválida.' }, { status: 403 }); }
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: 'Dados inválidos.' }, { status: 400 }); }
  const currentPassword = body.currentPassword;
  const newPassword = body.newPassword;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 256) {
    return Response.json({ error: 'A nova senha deve ter entre 12 e 256 caracteres.' }, { status: 400 });
  }
  try {
    const rows = await dbQuery('SELECT password_hash FROM users WHERE id = $1 AND active = TRUE LIMIT 1', [user.id]);
    const hash = (rows[0] as Record<string, unknown> | undefined)?.password_hash;
    if (typeof hash !== 'string' || !(await verifyPassword(currentPassword, hash))) return Response.json({ error: 'A senha atual está incorreta.' }, { status: 401 });
    await dbQuery('UPDATE users SET password_hash = $1, must_change_password = FALSE, updated_at = NOW() WHERE id = $2', [await hashPassword(newPassword), user.id]);
    await dbQuery('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [user.id]);
    await writeAudit(user.id, 'password.changed', 'user', user.id);
    await revokeCurrentSession();
    return Response.json({ ok: true, reauthenticate: true });
  } catch {
    return Response.json({ error: 'Não foi possível alterar a senha agora.' }, { status: 503 });
  }
}
