import { publicUser } from '@/lib/auth';
import { apiUser, unauthorized } from '@/lib/api';

export const runtime = 'nodejs';
export async function GET() {
  const user = await apiUser();
  return user ? Response.json({ user: publicUser(user) }) : unauthorized();
}
