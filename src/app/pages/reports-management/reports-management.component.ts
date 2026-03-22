import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';

type ReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

@Component({
  selector: 'app-reports-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterLink],
  templateUrl: './reports-management.component.html',
  styleUrl: './reports-management.component.css',
})
export class ReportsManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  loading = signal(false);
  error = signal<string | null>(null);
  search = signal('');
  statusFilter = signal<ReportStatus | 'ALL'>('ALL');
  dateFrom = signal('');
  dateTo = signal('');
  reports = signal<any[]>([]);
  statuses: ReportStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  statusLabels: Record<string, string> = {
    OPEN: 'Mới',
    IN_PROGRESS: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    REJECTED: 'Từ chối',
  };

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const sf = this.statusFilter();
    const df = this.dateFrom();
    const dt = this.dateTo();
    return this.reports()
      .filter((r) => (sf === 'ALL' ? true : r.status === sf))
      .filter((r) => {
        if (!df && !dt) return true;
        const created = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : '';
        if (df && created < df) return false;
        if (dt && created > dt) return false;
        return true;
      })
      .filter((r) => {
        if (!q) return true;
        const hay = `${r.reporter_username ?? ''} ${r.target_username ?? ''} ${r.reason ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
  });

  ngOnInit(): void {
    this.adminService.getCsrf().subscribe({ next: () => this.load(), error: () => this.load() });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getReports().subscribe({
      next: (data) => {
        this.reports.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không tải được danh sách báo cáo.');
        this.loading.set(false);
      },
    });
  }

  selectedReport = signal<any>(null);
  showModal = signal(false);
  replyText = signal('');
  actionChoice = signal('NONE');
  newStatus = signal<ReportStatus>('OPEN');

  openProcessModal(report: any): void {
    this.selectedReport.set(report);
    this.newStatus.set(report.status);
    this.replyText.set(report.admin_reply || '');
    this.actionChoice.set('NONE');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedReport.set(null);
  }

  // Submit kết quả xử lý report lên server
  submitProcess(): void {
    const r = this.selectedReport();
    if (!r) return;
    
    this.loading.set(true);
    // Update status, reply và xử phạt thông qua service
    this.adminService.updateReportStatus(
      r.id, 
      this.newStatus(), 
      this.replyText(), 
      this.actionChoice()
    ).subscribe({
      next: () => {
        alert('Xử lý báo cáo thành công!');
        this.closeModal(); 
        this.load(); // Refresh lại danh sách báo cáo
      },
      error: () => {
        this.error.set('Cập nhật báo cáo thất bại.');
        this.loading.set(false);
      }
    });
  }
}
