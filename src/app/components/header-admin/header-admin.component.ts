import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-headeradmin',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css']
})
export class HeaderAdminComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);

  // Số lượng thông báo chưa đọc (badge)
  unreadCount = signal(0);
  // Danh sách chi tiết các thông báo
  notifications = signal<any[]>([]);

  ngOnInit(): void {
    this.loadNotifications();
    // Tự động cập nhật thông báo sau mỗi 30 giây cho giống app thật
    setInterval(() => this.loadNotifications(), 30000);
  }

  // Hàm gọi API lấy thông báo từ Server
  loadNotifications() {
    this.adminService.getNotifications().subscribe({
      next: (res) => {
        this.unreadCount.set(res.unread_count);
        this.notifications.set(res.items);
      },
      error: () => {
        console.log('Lỗi khi tải thông báo. Có thể server đang khởi động lại.');
      }
    });
  }

  logout() {
    // Xử lý đăng xuất đơn giản (về trang login)
    this.router.navigate(['/login']);
  }
}
