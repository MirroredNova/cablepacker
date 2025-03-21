'use client';

import React, { useState } from 'react';
import SignInForm from './SignInForm';
import AdminActions from './AdminActions';

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  return authenticated ? <AdminActions /> : <SignInForm setAuthenticated={setAuthenticated} />;
}

export default AdminPage;
