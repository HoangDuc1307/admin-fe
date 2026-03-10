import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css',
})
export class UsersManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  loading = signal(false);
  error = signal<string | null>(null);
  search = signal('');
  statusFilter = signal<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  users = signal<any[]>([]);

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const sf = this.statusFilter();
    return this.users()
      .filter((u) => (sf === 'ALL' ? true : sf === 'ACTIVE' ? u.is_active : !u.is_active))
      .filter((u) => {
        if (!q) return true;
        const hay = `${u.username ?? ''} ${u.email ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
  });

  ngOnInit(): void {
    this.adminService.getCsrf().subscribe({ next: () => this.load(), error: () => this.load() });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không tải được danh sách người dùng.');
        this.loading.set(false);
      },
    });
  }

  block(u: any): void {
    if (!confirm(`Khóa tài khoản ${u.username}?`)) return;
    this.adminService.blockUser(u.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Khóa tài khoản thất bại.'),
    });
  }

  unblock(u: any): void {
    if (!confirm(`Mở khóa tài khoản ${u.username}?`)) return;
    this.adminService.unblockUser(u.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Mở khóa thất bại.'),
    });
  }
}
