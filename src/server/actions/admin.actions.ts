'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/server/auth/dal.auth';
import { serverConfig } from '@/config';

export async function signInAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (username === serverConfig.ADMIN_USERNAME && password === serverConfig.ADMIN_PASSWORD) {
    await createSession(username);
    redirect('/admin/dashboard');
  }
}

export async function logoutAction() {
  try {
    await deleteSession();
  } catch (error) {
    console.error('Error during logout:', error);
    // Continue execution even if deletion fails
  }

  redirect('/admin/login');
}
