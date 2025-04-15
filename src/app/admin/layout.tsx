import React, { PropsWithChildren } from 'react';
import AdminProvider from '@/components/providers/AdminProvider';

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}
