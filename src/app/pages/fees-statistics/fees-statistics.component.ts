import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-fees-statistics',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './fees-statistics.component.html',
  styleUrl: './fees-statistics.component.css',
})
export class FeesStatisticsComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);

  loading = false;
  stats = { total_revenue: 0, total_platform_fee: 0, total_transactions: 0, revenue_last_n_days: 0, platform_fee_last_n_days: 0, avg_fee_per_transaction: 0, days: 7 };
  ts = { labels: [] as string[], revenue: [] as number[], platform_fee: [] as number[] };
  topTransactions: any[] = [];
  savingReport = false;
  saveMessage = '';
  chartDays = 7;
  private chart?: Chart;

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  load(): void {
    this.loading = true;
    let done = 0;
    const onComplete = () => {
      done++;
      if (done >= 3) {
        this.loading = false;
        queueMicrotask(() => this.renderChart());
      }
    };
    this.adminService.getFeeStatistics(this.chartDays).subscribe({ next: (d) => (this.stats = { ...this.stats, ...d }), complete: onComplete });
    this.adminService.getDashboardTimeseries(this.chartDays).subscribe({ next: (d) => (this.ts = { labels: d?.labels ?? [], revenue: d?.revenue ?? [], platform_fee: d?.platform_fee ?? [] }), complete: onComplete });
    this.adminService.getFeeTopTransactions().subscribe({ next: (d) => (this.topTransactions = Array.isArray(d) ? d : []), complete: onComplete });
  }

  onChartDaysChange(): void {
    this.chartDays = Number(this.chartDays);
    this.load();
  }

  private renderChart(): void {
    const canvas = document.getElementById('feeChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    this.destroyChart();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.ts.labels ?? [],
        datasets: [
          { label: 'Phí sàn', data: this.ts.platform_fee ?? [], backgroundColor: 'rgba(245, 158, 11, 0.35)', borderColor: '#f59e0b', borderWidth: 1 },
          { label: 'Doanh thu', data: this.ts.revenue ?? [], backgroundColor: 'rgba(37, 99, 235, 0.25)', borderColor: '#2563eb', borderWidth: 1 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } },
    });
  }

  private destroyChart(): void {
    if (this.chart) { this.chart.destroy(); this.chart = undefined; }
  }

  saveReport(): void {
    if (!this.stats || !this.ts) { this.saveMessage = 'Chưa có dữ liệu để lưu.'; return; }
    this.savingReport = true;
    this.saveMessage = '';
    this.adminService.saveFeesReport(this.stats, this.ts).subscribe({
      next: () => { this.savingReport = false; this.saveMessage = 'Đã lưu báo cáo phí sàn.'; },
      error: () => { this.savingReport = false; this.saveMessage = 'Lưu thất bại.'; },
    });
  }
}
