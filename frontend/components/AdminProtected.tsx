'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/auth';

interface AdminProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to protect admin-only routes
 * Redirects non-admin users to the admin login page
 * SECURITY: This component ensures only authenticated admins can access protected routes
 */
export function AdminProtected({ children, fallback }: AdminProtectedProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isMounted } = useAuth();

  useEffect(() => {
    if (!isMounted || isLoading) return;

    // SECURITY CHECK 1: User must be authenticated
    if (!isAuthenticated) {
      console.log('🔒 AdminProtected: Not authenticated, redirecting to admin login');
      router.push('/auth/admin');
      return;
    }

    // SECURITY CHECK 2: User must have admin privileges
    const userIsAdmin = isAdmin();
    
    if (!userIsAdmin) {
      console.log('🔒 AdminProtected: Not authorized as admin');
      console.log('🔒 User role:', user?.role);
      console.log('🔒 isAdmin flag:', localStorage.getItem('isAdmin'));
      
      // Clear any potentially malicious data
      localStorage.removeItem('isAdmin');
      
      // If user is a donor, redirect to their home page
      if (user?.role === 'DONOR') {
        console.log('🔒 Redirecting DONOR to /home');
        router.push('/home');
      } else {
        // Unknown role or no role - redirect to admin login
        console.log('🔒 Redirecting to admin login');
        router.push('/auth/admin');
      }
      return;
    }

    console.log('✅ AdminProtected: Access granted to admin');
  }, [router, user, isAuthenticated, isLoading, isMounted]);

  // Show loading state
  if (!isMounted || isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Verifying access...</p>
          </div>
        </div>
      )
    );
  }

  // SECURITY: Only render children if authenticated AND admin
  if (isAuthenticated && isAdmin()) {
    return <>{children}</>;
  }

  // Return null while redirecting (prevents flash of unauthorized content)
  return null;
}
