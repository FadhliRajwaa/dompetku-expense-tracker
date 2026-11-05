import { ListSkeleton } from '@/components/skeletons/list-skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function AktivitasLoading() {
  return (
    <div aria-busy="true">
      <LoadingAnnouncer label="Memuat riwayat aktivitas" />
      <ListSkeleton variant="rows" rows={8} stats={0} />
    </div>
  );
}
