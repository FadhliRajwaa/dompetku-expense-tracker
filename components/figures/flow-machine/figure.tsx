import { Plate } from '@/components/iso/react/draw';
import { FlowMachineLive } from './live';

/**
 * Kartu ilustrasi mesin alur uang.
 *
 * Server component: hanya membungkus komponen live dengan bingkai dan teks
 * yang tetap, sehingga tidak ada JavaScript geometri yang ikut ke klien.
 */
export function FlowMachineFigure() {
  return (
    <div className="flow-machine-wrap">
      <Plate
        fig="Fig 01"
      title="Alur uang"
      hint="Koin masuk, disortir, lalu dihitung"
      readout="Rp 0 · 0 / 6 slot"
      keys={[
        { mark: 'raised', label: 'Corong & drum penyortir' },
        { mark: 'lit', label: 'Koin yang sedang bergerak' },
        { mark: 'flat', label: 'Dial penghitung saldo' },
      ]}
      caption="Koin masuk lewat corong, menggelinding menuruni talang, dan jatuh ke salah satu dari enam lubang drum. Drum berputar satu langkah setiap koin masuk, sementara jarum dial mencatat totalnya — persis seperti mencatat pemasukan lalu membaginya ke kategori."
    >
      <FlowMachineLive />
      </Plate>
    </div>
  );
}
