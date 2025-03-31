'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/server/auth/dal.server';

export async function signInAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    await createSession(username);
    redirect('/admin/dashboard');
  }
}

export async function logoutAction() {
  deleteSession();
  redirect('/admin/login');
}
