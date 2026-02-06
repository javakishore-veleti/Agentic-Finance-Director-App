import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavbarComponent } from '../top-navbar/top-navbar.component';

@Component({
  selector: 'afda-app-layout',
  standalone: true,
  imports: [RouterOutlet, TopNavbarComponent],
  template: `
    <afda-top-navbar />
    <div class="afda-layout">
      <router-outlet />
    </div>
  `
})
export class AppLayoutComponent {}
