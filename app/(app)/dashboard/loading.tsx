import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div aria-busy="true">
      <LoadingAnnouncer label="Memuat dashboard" />
      <DashboardSkeleton />
    </div>
  );
}
