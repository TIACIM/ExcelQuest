import { clientIp, assertSameOrigin, checkLoginRateLimit, clearLoginRateLimit, createSession, findUserByUsername, recordLoginFailure, verifyPassword, writeAudit, publicUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function credentials(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const { username, password } = value as Record<string, unknown>;
  if (typeof username !== 'string' || typeof password !== 'string') return null;
  const user = username.trim();
  if (user.length < 2 || user.length > 64 || password.length < 1 || password.length > 256) return null;
  return { username: user, password };
}

export async function POST(request: Request) {
  try { assertSameOrigin(request); } catch { return Response.json({ error: 'Origem da solicitação inválida.' }, { status: 403 }); }
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'Dados de acesso inválidos.' }, { status: 400 }); }
  const input = credentials(body);
  if (!input) return Response.json({ error: 'Informe usuário e senha válidos.' }, { status: 400 });
  const scope = `login:${input.username.toLocaleLowerCase('pt-BR')}:${clientIp(request)}`;
  try {
    if (await checkLoginRateLimit(scope)) return Response.json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, { status: 429 });
    const user = await findUserByUsername(input.username);
    if (!user || !user.active || !(await verifyPassword(input.password, user.passwordHash))) {
      await recordLoginFailure(scope);
      if (user) await writeAudit(user.id, 'login.failed', 'user', user.id, { ip: clientIp(request) });
      return Response.json({ error: 'Usuário ou senha inválidos.' }, { status: 401 });
    }
    await clearLoginRateLimit(scope);
    await createSession(user.id, request);
    await writeAudit(user.id, 'login.succeeded', 'user', user.id, { ip: clientIp(request) });
    return Response.json({ user: publicUser(user) });
  } catch {
    return Response.json({ error: 'Não foi possível autenticar agora. Tente novamente.' }, { status: 503 });
  }
}
