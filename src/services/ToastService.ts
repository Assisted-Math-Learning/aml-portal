import { toast, ToastContent, ToastOptions } from 'react-toastify';

class ToastService {
  private static _instance: ToastService;

  static getInstance(): ToastService {
    if (!this._instance) {
      this._instance = new ToastService();
    }
    return this._instance;
  }

  showError(content: ToastContent, config?: ToastOptions) {
    toast.dismiss();
    toast(content, {
      ...config,
      type: 'error',
      position: config?.position || 'top-center',
      autoClose: config?.delay || 2000,
    });
  }

  showInfo(content: ToastContent, config?: ToastOptions) {
    toast.dismiss();
    toast(content, {
      ...config,
      type: 'info',
      position: config?.position || 'top-center',
      autoClose: config?.autoClose || 2000,
    });
  }

  showSuccess(content: ToastContent, config?: ToastOptions) {
    toast.dismiss();
    toast(content, {
      ...config,
      type: 'success',
      position: config?.position || 'top-center',
      autoClose: config?.autoClose || 2000,
    });
  }

  showWarning(content: ToastContent, config?: ToastOptions) {
    toast.dismiss();
    toast(content, {
      ...config,
      type: 'warning',
      position: config?.position || 'top-center',
      autoClose: config?.autoClose || 2000,
    });
  }

  dismiss(toastRef: any) {
    toast.dismiss(toastRef);
  }
}

export const toastService = ToastService.getInstance();
