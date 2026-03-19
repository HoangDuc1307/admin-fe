import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getCsrf(): Observable<any> {
    return this.http.get(`${this.baseUrl}/csrf/`, { withCredentials: true });
  }

  getDashboardSummary(days = 7): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/summary/`, {
      params: { days },
      withCredentials: true,
    });
  }

  /** Lấy summary + timeseries trong 1 request → load nhanh hơn */
  getDashboardData(days = 7): Observable<{ summary: any; timeseries: any }> {
    return this.http.get<{ summary: any; timeseries: any }>(`${this.baseUrl}/dashboard/`, {
      params: { days },
      withCredentials: true,
    });
  }

  getDashboardTimeseries(days = 7): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/timeseries/`, {
      params: { days },
      withCredentials: true,
    });
  }

  exportDashboardReport(days = 7): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/dashboard/export-report/`, {
      params: { days },
      withCredentials: true,
      responseType: 'blob'
    });
  }

  getListings(status?: string): Observable<any[]> {
    const params: any = {};
    if (status) params.status = status;
    return this.http.get<any[]>(`${this.baseUrl}/listings/`, {
      params,
      withCredentials: true,
    });
  }

  approveListing(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/listings/${id}/approve/`, null, {
      withCredentials: true,
    });
  }

  getPriceHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/listings/${id}/price-history/`, {
      withCredentials: true,
    });
  }

  rejectListing(id: number, reason: string = 'Không có lý do'): Observable<any> {
    return this.http.post(`${this.baseUrl}/listings/${id}/reject/`, { reason }, {
      withCredentials: true,
    });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/`, {
      withCredentials: true,
    });
  }

  blockUser(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${id}/block/`, null, {
      withCredentials: true,
    });
  }

  unblockUser(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${id}/unblock/`, null, {
      withCredentials: true,
    });
  }

  getUserActivity(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}/activity/`, {
      withCredentials: true,
    });
  }

  getReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports/`, {
      withCredentials: true,
    });
  }

  updateReportStatus(id: number, status: string, admin_reply?: string, action?: string): Observable<any> {
    const payload: any = { status };
    if (admin_reply !== undefined) payload.admin_reply = admin_reply;
    if (action !== undefined) payload.action = action;

    return this.http.post(
      `${this.baseUrl}/reports/${id}/resolve/`,
      payload,
      { withCredentials: true },
    );
  }

  getFeeStatistics(days = 7): Observable<any> {
    return this.http.get(`${this.baseUrl}/fees/statistics/`, {
      params: { days },
      withCredentials: true,
    });
  }

  getFeeTopTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fees/top-transactions/`, {
      withCredentials: true,
    });
  }

  saveDashboardReport(summary: any, timeseries: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/dashboard/save-report/`,
      { summary, timeseries },
      { withCredentials: true },
    );
  }

  saveFeesReport(stats: any, timeseries: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/fees/save-report/`,
      { stats, timeseries },
      { withCredentials: true },
    );
  }

  exportFeesReport(days = 7): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/fees/export-report/`, {
      params: { days },
      withCredentials: true,
      responseType: 'blob',
    });
  }

  getAuditLogs(actionParam?: string): Observable<any[]> {
    const params: any = {};
    if (actionParam && actionParam !== 'ALL') {
      params.action = actionParam;
    }
    return this.http.get<any[]>(`${this.baseUrl}/logs/`, {
      params,
      withCredentials: true,
    });
  }

  getNotifications(): Observable<{ unread_count: number; items: any[] }> {
    return this.http.get<{ unread_count: number; items: any[] }>(`${this.baseUrl}/dashboard/notifications/`, {
      withCredentials: true,
    });
  }
}
