import React, { PropsWithChildren } from 'react';
import Navigation from '@/components/ui/Navigation';

export default function HomeLayout({ children }: PropsWithChildren) {
  return <Navigation>{children}</Navigation>;
}
