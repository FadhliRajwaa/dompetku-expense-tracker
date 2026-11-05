import { ListSkeleton } from '@/components/skeletons/list-skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function AnggaranLoading() {
  return (
    <div aria-busy="true">
      <LoadingAnnouncer label="Memuat anggaran" />
      <ListSkeleton variant="cards" rows={6} stats={3} />
    </div>
  );
}
