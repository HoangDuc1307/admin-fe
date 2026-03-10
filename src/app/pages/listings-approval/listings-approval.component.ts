import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

type ListingStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

@Component({
  selector: 'app-listings-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './listings-approval.component.html',
  styleUrl: './listings-approval.component.css',
})
export class ListingsApprovalComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  status = signal<ListingStatus>('ALL');
  search = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  items = signal<any[]>([]);

  filteredItems = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.items();
    return this.items().filter((x) => (x.title ?? '').toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.adminService.getCsrf().subscribe({ next: () => this.load(), error: () => this.load() });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getListings(this.status() === 'ALL' ? undefined : this.status()).subscribe({
      next: (data) => {
        this.items.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không tải được danh sách bài đăng.');
        this.loading.set(false);
      },
    });
  }

  setStatus(s: ListingStatus): void {
    this.status.set(s);
    this.load();
  }

  approve(id: number): void {
    if (!confirm('Duyệt bài đăng này?')) return;
    this.adminService.approveListing(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Duyệt thất bại (kiểm tra đăng nhập admin/CSRF).'),
    });
  }

  reject(id: number): void {
    if (!confirm('Từ chối bài đăng này?')) return;
    this.adminService.rejectListing(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Từ chối thất bại (kiểm tra đăng nhập admin/CSRF).'),
    });
  }
}



