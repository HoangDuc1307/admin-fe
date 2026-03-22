import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import Chart from 'chart.js/auto';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly adminService = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  summary = { total_users: 0, total_listings: 0, total_transactions: 0, total_revenue: 0, listings_last_n_days: 0, transactions_last_n_days: 0, days: 7 };
  loadingSummary = false;
  loadingChart = false;
  ts = { labels: [] as string[], listings_created: [] as number[], transactions_count: [] as number[] };
  savingReport = false;
  saveMessage = '';
  chartDays = 7;

  @ViewChild('growthChart', { static: false }) growthChart?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngOnInit(): void {
    this.loadSummary();
    this.loadChart();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.renderChart());
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  /** Tải 6 thẻ thống kê; giao diện hiển thị sẵn với 0, cập nhật khi có data */
  loadSummary(): void {
    this.loadingSummary = true;
    this.adminService.getDashboardSummary(this.chartDays).subscribe({
      next: (data) => {
        this.summary = { ...this.summary, ...data };
        this.loadingSummary = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingSummary = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** Tải biểu đồ; giao diện hiển thị sẵn biểu đồ rỗng, cập nhật khi có data */
  loadChart(): void {
    this.loadingChart = true;
    this.adminService.getDashboardTimeseries(this.chartDays).subscribe({
      next: (data) => {
        this.ts = { labels: data?.labels ?? [], listings_created: data?.listings_created ?? [], transactions_count: data?.transactions_count ?? [] };
        this.loadingChart = false;
        this.cdr.detectChanges();
        queueMicrotask(() => this.renderChart());
      },
      error: () => {
        this.loadingChart = false;
        this.cdr.detectChanges();
      },
    });
  }

  onChartDaysChange(): void {
    this.loadSummary();
    this.loadChart();
  }

  loadAll(): void {
    this.loadSummary();
    this.loadChart();
  }

  private renderChart(): void {
    if (!this.growthChart?.nativeElement) return;
    this.destroyChart();
    const ctx = this.growthChart.nativeElement.getContext('2d');
    if (!ctx) return;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.ts.labels ?? [],
        datasets: [
          {
            label: 'Bài đăng mới',
            data: this.ts.listings_created ?? [],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            tension: 0.25,
          },
          {
            label: 'Giao dịch',
            data: this.ts.transactions_count ?? [],
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.15)',
            tension: 0.25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  saveReport(): void {
    if (!this.summary || !this.ts) {
      this.saveMessage = 'Chưa có dữ liệu để lưu.';
      return;
    }
    this.savingReport = true;
    this.saveMessage = '';
    const days = this.chartDays || this.summary.days || 7;
    this.adminService.exportDashboardReport(days).pipe(
      finalize(() => {
        this.savingReport = false;
        this.cdr.detectChanges(); // Force render lại UI
      })
    ).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-report-${days}-days.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.saveMessage = 'Đã tải file báo cáo (Excel).';
      },
      error: () => {
        this.saveMessage = 'Xuất báo cáo thất bại (kiểm tra đăng nhập admin).';
      },
    });
  }
}
