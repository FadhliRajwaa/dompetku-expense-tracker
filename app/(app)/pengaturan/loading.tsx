import { SettingsSkeleton } from '@/components/skeletons/settings-skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function PengaturanLoading() {
  return (
    <div aria-busy="true">
      <LoadingAnnouncer label="Memuat pengaturan" />
      <SettingsSkeleton />
    </div>
  );
}
