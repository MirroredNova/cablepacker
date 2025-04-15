import React from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/pages/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Admin Login',
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
