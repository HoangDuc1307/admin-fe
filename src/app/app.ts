import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar';
import { HeaderAdminComponent } from './components/header-admin/header-admin.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent, HeaderAdminComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {}
