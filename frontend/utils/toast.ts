import Swal, { type SweetAlertIcon } from 'sweetalert2';
import type { ToastIcon } from '@/types';

const Toast =
  typeof window !== 'undefined'
    ? Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        customClass: {
          popup:
            'rounded-2xl shadow-xl border border-slate-100/80 bg-white/95 backdrop-blur-md p-4 font-sans text-sm text-slate-800',
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
      })
    : null;

export const showToast = (icon: ToastIcon, title: string): void => {
  if (Toast) {
    void Toast.fire({
      icon: icon as SweetAlertIcon,
      title,
    });
  }
};
