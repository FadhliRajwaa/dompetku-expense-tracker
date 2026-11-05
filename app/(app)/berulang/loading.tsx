import { ListSkeleton } from '@/components/skeletons/list-skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function BerulangLoading() {
  return (
    <div aria-busy="true">
      <LoadingAnnouncer label="Memuat transaksi berulang" />
      <ListSkeleton variant="rows" rows={5} stats={0} />
    </div>
  );
}
