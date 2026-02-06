import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) { this.add('success', message); }
  error(message: string)   { this.add('error', message); }
  warning(message: string) { this.add('warning', message); }
  info(message: string)    { this.add('info', message); }

  private add(type: Toast['type'], message: string) {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
