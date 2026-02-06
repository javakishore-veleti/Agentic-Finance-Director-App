import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({ selector: '[afdaClickOutside]', standalone: true })
export class ClickOutsideDirective {
  @Output() afdaClickOutside = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement) {
    if (!this.el.nativeElement.contains(target)) {
      this.afdaClickOutside.emit();
    }
  }
}
