import 'server-only';

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { dbQuery, type Role } from '@/db';

export const AUTH_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'excelquest_session';
const SESSION_SECONDS = 60 * 60 * 8;

export type AuthUser = { id: string; username: string; role: Role; active: boolean; mustChangePassword: boolean };
type UserWithHash = AuthUser & { passwordHash: string };

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex');
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin && process.env.NODE_ENV !== 'production') return;
  const url = new URL(request.url);
  const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || url.protocol.slice(0, -1);
  const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || request.headers.get('host') || url.host;
  const expected = `${protocol}://${host}`;
  if (!origin || origin !== expected) throw new Error('ORIGIN_MISMATCH');
}

function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: SESSION_SECONDS };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const rows = await dbQuery(`SELECT u.id, u.username, u.role, u.active, u.must_change_password
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW()
    LIMIT 1`, [hashToken(token)]);
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row || !row.active) return null;
  return { id: String(row.id), username: String(row.username), role: row.role as Role, active: Boolean(row.active), mustChangePassword: Boolean(row.must_change_password) };
}

export async function findUserByUsername(username: string): Promise<UserWithHash | null> {
  const rows = await dbQuery(`SELECT id, username, password_hash, role, active, must_change_password
    FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1`, [username]);
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: String(row.id), username: String(row.username), passwordHash: String(row.password_hash), role: row.role as Role,
    active: Boolean(row.active), mustChangePassword: Boolean(row.must_change_password),
  };
}

export async function createSession(userId: string, request: Request) {
  const token = randomBytes(32).toString('base64url');
  await dbQuery(`INSERT INTO sessions (id, user_id, token_hash, expires_at, ip_hash, user_agent)
    VALUES ($1, $2, $3, NOW() + INTERVAL '8 hours', $4, $5)`, [
    randomUUID(), userId, hashToken(token), hashIp(clientIp(request)), request.headers.get('user-agent')?.slice(0, 500) || null,
  ]);
  (await cookies()).set(AUTH_COOKIE_NAME, token, cookieOptions());
}

export async function revokeCurrentSession() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (token) await dbQuery('UPDATE sessions SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL', [hashToken(token)]);
  (await cookies()).set(AUTH_COOKIE_NAME, '', { ...cookieOptions(), maxAge: 0 });
}

export async function writeAudit(actorUserId: string | null, action: string, targetType?: string, targetId?: string, metadata: Record<string, unknown> = {}) {
  await dbQuery(`INSERT INTO audit_logs (id, actor_user_id, action, target_type, target_id, metadata)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)`, [randomUUID(), actorUserId, action, targetType || null, targetId || null, JSON.stringify(metadata)]);
}

export async function checkLoginRateLimit(scope: string) {
  const rows = await dbQuery('SELECT locked_until FROM auth_rate_limits WHERE scope = $1 LIMIT 1', [scope]);
  const lockedUntil = (rows[0] as Record<string, unknown> | undefined)?.locked_until;
  const lockTime = lockedUntil instanceof Date ? lockedUntil.getTime() : (typeof lockedUntil === 'string' || typeof lockedUntil === 'number' ? new Date(lockedUntil).getTime() : 0);
  return lockTime > Date.now();
}

export async function recordLoginFailure(scope: string) {
  await dbQuery(`INSERT INTO auth_rate_limits (scope, attempt_count, window_started_at, locked_until, updated_at)
    VALUES ($1, 1, NOW(), NULL, NOW())
    ON CONFLICT (scope) DO UPDATE SET
      attempt_count = CASE WHEN auth_rate_limits.window_started_at < NOW() - INTERVAL '15 minutes' THEN 1 ELSE auth_rate_limits.attempt_count + 1 END,
      window_started_at = CASE WHEN auth_rate_limits.window_started_at < NOW() - INTERVAL '15 minutes' THEN NOW() ELSE auth_rate_limits.window_started_at END,
      locked_until = CASE WHEN (CASE WHEN auth_rate_limits.window_started_at < NOW() - INTERVAL '15 minutes' THEN 1 ELSE auth_rate_limits.attempt_count + 1 END) >= 5 THEN NOW() + INTERVAL '15 minutes' ELSE auth_rate_limits.locked_until END,
      updated_at = NOW()`, [scope]);
}

export async function clearLoginRateLimit(scope: string) {
  await dbQuery('DELETE FROM auth_rate_limits WHERE scope = $1', [scope]);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function isRole(value: unknown): value is Role {
  return value === 'superadmin' || value === 'admin' || value === 'manager' || value === 'collaborator';
}

export function publicUser(user: AuthUser) {
  return { id: user.id, username: user.username, role: user.role, mustChangePassword: user.mustChangePassword };
}
