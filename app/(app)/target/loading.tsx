import { ListSkeleton } from '@/components/skeletons/list-skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function TargetLoading() {
  return (
    <div aria-busy="true">
      <LoadingAnnouncer label="Memuat target tabungan" />
      <ListSkeleton variant="cards" rows={4} stats={0} />
    </div>
  );
}
