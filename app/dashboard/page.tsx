import { getUser } from '@/lib/auth';
import { DashboardClient } from './DashboardClient';

export default async function Dashboard() {
  const user = await getUser();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please <a href="/(auth)/login" className="text-accent-blue hover:underline">log in</a> to access your dashboard.</p>
      </div>
    );
  }

  return <DashboardClient user={user} />;
}