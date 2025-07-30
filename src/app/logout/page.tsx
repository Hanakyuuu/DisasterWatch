'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear auth/session data (adjust based on your setup)
    localStorage.removeItem('authToken');
    // Optionally clear cookies/sessionStorage/etc. here

    // Redirect to homepage
    router.push('/');
  }, [router]);

  return null; // No UI
};

export default LogoutPage;