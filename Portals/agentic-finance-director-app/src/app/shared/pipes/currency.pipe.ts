import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'afdaCurrency', standalone: true })
export class CurrencyPipe implements PipeTransform {
  transform(value: number | null, currency = 'USD', compact = false): string {
    if (value == null) return '—';
    if (compact) {
      const abs = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
      return `${sign}$${abs.toFixed(0)}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }
}
