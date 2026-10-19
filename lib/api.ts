import { getCurrentUser, type AuthUser } from '@/lib/auth';

export async function apiUser() {
  return getCurrentUser();
}

export function unauthorized() {
  return Response.json({ error: 'Sua sessão expirou ou não é válida. Entre novamente.' }, { status: 401 });
}

export function forbidden() {
  return Response.json({ error: 'Você não tem permissão para realizar esta ação.' }, { status: 403 });
}

export function isSuperadmin(user: AuthUser | null) {
  return user?.role === 'superadmin';
}
