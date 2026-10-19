import { getProgress, normaliseProgress, saveProgress } from '@/db';
import { assertSameOrigin } from '@/lib/auth';
import { apiUser, unauthorized } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await apiUser();
  if (!user) return unauthorized();
  try { return Response.json({ progress: await getProgress(user.id) }); }
  catch { return Response.json({ error: 'Não foi possível carregar seu progresso agora.' }, { status: 503 }); }
}

export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return unauthorized();
  try { assertSameOrigin(request); } catch { return Response.json({ error: 'Origem da solicitação inválida.' }, { status: 403 }); }
  let body: { progress?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }
  const progress = normaliseProgress(body.progress);
  if (!progress) return Response.json({ error: 'Formato de progresso inválido.' }, { status: 400 });
  try { await saveProgress(user.id, progress); return Response.json({ progress }); }
  catch { return Response.json({ error: 'Não foi possível salvar seu progresso agora.' }, { status: 503 }); }
}
