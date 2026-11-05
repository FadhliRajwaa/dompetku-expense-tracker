import { ListSkeleton } from '@/components/skeletons/list-skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function KeluargaLoading() {
  return (
    <div aria-busy="true">
      <LoadingAnnouncer label="Memuat rumah tangga" />
      <ListSkeleton variant="rows" rows={4} stats={0} />
    </div>
  );
}
