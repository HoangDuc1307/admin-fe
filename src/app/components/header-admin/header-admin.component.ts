import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-headeradmin',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css']
})
export class HeaderAdminComponent {
  private readonly router = inject(Router);

  logout() {
    this.router.navigate(['/login']);
  }
}
