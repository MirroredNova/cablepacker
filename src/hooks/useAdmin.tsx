import React from 'react';
import { AdminContext } from '@/context/AdminContext';

export default function useAdmin() {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
