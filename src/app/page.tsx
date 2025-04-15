import React from 'react';
import type { Metadata } from 'next';
import HomePage from '@/components/pages/home/HomePage';

export const metadata: Metadata = {
  title: 'Home',
};

export default function Home() {
  return <HomePage />;
}
