import { assertSameOrigin, revokeCurrentSession, writeAudit } from '@/lib/auth';
import { apiUser, unauthorized } from '@/lib/api';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return unauthorized();
  try { assertSameOrigin(request); } catch { return Response.json({ error: 'Origem da solicitação inválida.' }, { status: 403 }); }
  try { await writeAudit(user.id, 'logout', 'user', user.id); await revokeCurrentSession(); return Response.json({ ok: true }); }
  catch { return Response.json({ error: 'Não foi possível encerrar a sessão agora.' }, { status: 503 }); }
}
