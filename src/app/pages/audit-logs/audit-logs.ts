import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, PaginatedResponse } from '../../services/admin.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';

type AuditAction = 'ALL' | 'BLOCK_USER' | 'UNBLOCK_USER' | 'APPROVE_LISTING' | 'REJECT_LISTING' | 'UPDATE_REPORT_STATUS' | 'RESOLVE_REPORT' | 'SAVE_DASHBOARD_REPORT' | 'SAVE_FEES_REPORT' | 'SAVE_REPORT';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, PaginationComponent],
  templateUrl: './audit-logs.html',
})
export class AuditLogsComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  loading = signal(false);
  error = signal<string | null>(null);
  search = signal('');
  actionFilter = signal<AuditAction>('ALL');
  dateFrom = signal('');
  dateTo = signal('');
  
  logs = signal<any[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = 10;

  actions: Exclude<AuditAction, 'ALL'>[] = [
    'APPROVE_LISTING', 
    'REJECT_LISTING', 
    'BLOCK_USER', 
    'UNBLOCK_USER', 
    'RESOLVE_REPORT',
    'UPDATE_REPORT_STATUS',
    'SAVE_DASHBOARD_REPORT',
    'SAVE_FEES_REPORT'
  ];
  
  actionLabels: Record<string, string> = {
    APPROVE_LISTING: 'Duyệt bài',
    REJECT_LISTING: 'Từ chối bài',
    BLOCK_USER: 'Khóa tài khoản',
    UNBLOCK_USER: 'Mở khóa tài khoản',
    RESOLVE_REPORT: 'Giải quyết báo cáo',
    UPDATE_REPORT_STATUS: 'Cập nhật báo cáo',
    SAVE_DASHBOARD_REPORT: 'Lưu snapshot Dashboard',
    SAVE_FEES_REPORT: 'Lưu snapshot Phí sàn',
    SAVE_REPORT: 'Lưu báo cáo',
  };

  // Lọc log theo ngày và search text cho chuẩn
  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const df = this.dateFrom();
    const dt = this.dateTo();

    return this.logs()
      .filter((l) => {
        // Lọc theo khoảng ngày nếu admin có chọn
        if (!df && !dt) return true;
        const ts = l.timestamp ? new Date(l.timestamp).toISOString().slice(0, 10) : '';
        if (df && ts < df) return false;
        if (dt && ts > dt) return false;
        return true;
      })
      .filter((l) => {
        // Search nhanh theo admin, đối tượng hoặc chi tiết hành động
        if (!q) return true;
        const hay = `${l.admin_username ?? ''} ${l.target_object ?? ''} ${l.details ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
  });

  ngOnInit(): void {
    // Check CSRF cái rồi mới cho load data
    this.adminService.getCsrf().subscribe({ next: () => this.load(), error: () => this.load() });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const actionParam = this.actionFilter() === 'ALL' ? undefined : this.actionFilter();
    
    this.adminService.getAuditLogs(actionParam, this.currentPage()).subscribe({
      next: (res: PaginatedResponse<any>) => {
        this.logs.set(res.results || []);
        this.totalItems.set(res.count || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không tải được danh sách nhật ký.');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.load();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.load();
  }
}
