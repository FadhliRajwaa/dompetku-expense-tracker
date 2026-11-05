import { ListSkeleton } from '@/components/skeletons/list-skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function TransaksiLoading() {
  return (
    <div aria-busy="true">
      <LoadingAnnouncer label="Memuat transaksi" />
      <ListSkeleton variant="table" rows={8} />
    </div>
  );
}
