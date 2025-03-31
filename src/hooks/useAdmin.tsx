import React from 'react';
import { AdminContext } from '@/components/providers/AdminProvider';

export default function useAdmin() {
  const context = React.useContext(AdminContext);
  if (context === null) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
