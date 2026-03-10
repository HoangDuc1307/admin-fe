import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'pages/dashboard', pathMatch: 'full' },
  { path: 'pages/dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'pages/listings', loadComponent: () => import('./pages/listings-approval/listings-approval.component').then(m => m.ListingsApprovalComponent) },
  { path: 'pages/users', loadComponent: () => import('./pages/users-management/users-management.component').then(m => m.UsersManagementComponent) },
  { path: 'pages/reports', loadComponent: () => import('./pages/reports-management/reports-management.component').then(m => m.ReportsManagementComponent) },
  { path: 'pages/fees', loadComponent: () => import('./pages/fees-statistics/fees-statistics.component').then(m => m.FeesStatisticsComponent) },
];
