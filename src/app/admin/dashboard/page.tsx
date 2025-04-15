import React from 'react';
import type { Metadata } from 'next';
import AdminDashboard from '@/components/pages/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
