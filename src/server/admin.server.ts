'use server';

export async function signInAction(email: string, password: string): Promise<boolean> {
  if (email === process.env.USERNAME && password === process.env.PASSWORD) {
    return true;
  }

  return false;
}
