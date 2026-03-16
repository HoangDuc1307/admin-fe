import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

type AuditAction = 'ALL' | 'BLOCK_USER' | 'UNBLOCK_USER' | 'APPROVE_LISTING' | 'REJECT_LISTING' | 'UPDATE_REPORT_STATUS';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
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

  actions: Exclude<AuditAction, 'ALL'>[] = [
    'APPROVE_LISTING', 
    'REJECT_LISTING', 
    'BLOCK_USER', 
    'UNBLOCK_USER', 
    'UPDATE_REPORT_STATUS'
  ];
  
  actionLabels: Record<string, string> = {
    APPROVE_LISTING: 'Duyệt bài',
    REJECT_LISTING: 'Từ chối bài',
    BLOCK_USER: 'Khóa tài khoản',
    UNBLOCK_USER: 'Mở khóa tài khoản',
    UPDATE_REPORT_STATUS: 'Cập nhật báo cáo',
  };

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const df = this.dateFrom();
    const dt = this.dateTo();

    return this.logs()
      .filter((l) => {
        if (!df && !dt) return true;
        const ts = l.timestamp ? new Date(l.timestamp).toISOString().slice(0, 10) : '';
        if (df && ts < df) return false;
        if (dt && ts > dt) return false;
        return true;
      })
      .filter((l) => {
        if (!q) return true;
        const hay = `${l.admin_username ?? ''} ${l.target_object ?? ''} ${l.details ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
  });

  ngOnInit(): void {
    this.adminService.getCsrf().subscribe({ next: () => this.load(), error: () => this.load() });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const actionParam = this.actionFilter() === 'ALL' ? undefined : this.actionFilter();
    
    this.adminService.getAuditLogs(actionParam).subscribe({
      next: (data) => {
        this.logs.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không tải được danh sách nhật ký.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.load();
  }
}
