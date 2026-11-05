'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Nilai yang tertinggal dari input sebenarnya selama `delay` milidetik.
 *
 * Dipakai untuk pencarian: mengetik "makanan" tidak boleh memicu lima
 * permintaan/penyaringan; hanya nilai akhir yang dipakai.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (delay <= 0) {
      setDebounced(value);
      return;
    }
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/**
 * Versi callback. Referensi fungsi stabil, dan pemanggilan terakhir yang menang
 * (panggilan sebelumnya dibatalkan). Bersihkan timer saat unmount supaya tidak
 * ada setState pada komponen yang sudah hilang.
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 300,
) {
  const fnRef = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );
}
