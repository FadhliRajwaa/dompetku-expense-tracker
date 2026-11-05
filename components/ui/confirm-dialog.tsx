'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';

/**
 * Dialog konfirmasi menggantikan `window.confirm()`.
 *
 * `confirm()` bawaan browser memblokir thread, tidak bisa ditata, dan di
 * sebagian browser mobile tampil sebagai kotak abu-abu dengan nama domain —
 * bukan bagian dari aplikasi. Komponen ini mempertahankan alur yang sama
 * (promise `boolean`) tetapi memakai dialog Base UI yang fokusnya terkelola.
 */
export function useConfirm() {
  const [state, setState] = React.useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmLabel: string;
    destructive: boolean;
    resolve?: (v: boolean) => void;
  }>({ open: false, title: '', confirmLabel: 'Lanjutkan', destructive: false });

  const confirm = React.useCallback(
    (opts: {
      title: string;
      description?: string;
      confirmLabel?: string;
      destructive?: boolean;
    }) =>
      new Promise<boolean>((resolve) => {
        setState({
          open: true,
          title: opts.title,
          description: opts.description,
          confirmLabel: opts.confirmLabel ?? 'Lanjutkan',
          destructive: opts.destructive ?? false,
          resolve,
        });
      }),
    [],
  );

  const settle = (value: boolean) => {
    state.resolve?.(value);
    setState((s) => ({ ...s, open: false, resolve: undefined }));
  };

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      destructive={state.destructive}
      onOpenChange={(v) => !v && settle(false)}
      onConfirm={() => settle(true)}
    />
  );

  return { confirm, confirmDialog: dialog };
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  destructive: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          data-lenis-prevent
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-popover p-5 text-popover-foreground shadow-xl ring-1 ring-foreground/10 outline-none sm:max-w-[24rem]',
            'duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full',
                destructive
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
              )}
              aria-hidden="true"
            >
              <AlertTriangle className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-[15px] font-bold leading-snug">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              render={
                <button
                  type="button"
                  className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Tutup"
                />
              }
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl px-4 text-[13px] font-semibold"
            >
              Batal
            </Button>
            <Button
              onClick={onConfirm}
              className={cn(
                'h-10 rounded-xl px-4 text-[13px] font-bold text-white',
                destructive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-brand-500 hover:bg-brand-600',
              )}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
