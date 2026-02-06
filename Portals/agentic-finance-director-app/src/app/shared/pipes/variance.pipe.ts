import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'variance', standalone: true })
export class VariancePipe implements PipeTransform {
  transform(value: number | null): 'favorable' | 'unfavorable' | 'neutral' {
    if (value == null || value === 0) return 'neutral';
    return value < 0 ? 'favorable' : 'unfavorable';
  }
}
