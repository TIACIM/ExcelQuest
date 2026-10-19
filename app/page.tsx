import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';
import { getProgress } from '@/db';
import { getCurrentUser, publicUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const progress = await getProgress(user.id);
  return <DashboardClient currentUser={publicUser(user)} initialProgress={progress} />;
}
