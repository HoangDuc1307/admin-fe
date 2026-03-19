import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminService = inject(AdminService);

  userId = signal<number | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<any>(null);

  statusLabels: Record<string, string> = {
    OPEN: 'Mới',
    IN_PROGRESS: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    REJECTED: 'Từ chối',
    APPROVED: 'Đã duyệt',
    PENDING: 'Chờ duyệt',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(+id);
      this.load();
    }
  }

  load(): void {
    this.loading.set(true);
    this.adminService.getUserActivity(this.userId()!).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không thể tải thông tin chi tiết người dùng.');
        this.loading.set(false);
      }
    });
  }

  // Hàm xử lý Khóa/Mở khóa người dùng
  toggleBlock(): void {
    const user = this.data().user;
    const isBlocked = user.profile?.is_blocked;
    const actionText = isBlocked ? 'mở khóa' : 'khóa';
    
    // Hiển thị hộp thoại xác nhận trước khi thực hiện
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này không?`)) return;

    const obs = isBlocked 
      ? this.adminService.unblockUser(user.id) 
      : this.adminService.blockUser(user.id);
    
    obs.subscribe(() => {
      alert(`Đã ${actionText} tài khoản thành công!`);
      this.load(); // Tải lại dữ liệu sau khi xong
    });
  }
}
