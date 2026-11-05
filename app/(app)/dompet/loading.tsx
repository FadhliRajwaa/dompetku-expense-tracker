import { ListSkeleton } from '@/components/skeletons/list-skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function DompetLoading() {
  return (
    <div aria-busy="true">
      <LoadingAnnouncer label="Memuat dompet" />
      <ListSkeleton variant="cards" rows={4} stats={3} />
    </div>
  );
}
