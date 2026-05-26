'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { User } from '@/lib/auth';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeft,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface DonorProfile {
  id: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt: string | null;
  rejectionReason: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    if (userData) {
      setUser(userData);
      
      // Fetch donor profile if user is a donor
      if (userData.role === 'DONOR') {
        fetchDonorProfile(userData.id);
      }
    }
    setLoading(false);
  }, [router]);

  // Poll for updates every 5 seconds if status is PENDING
  useEffect(() => {
    if (!user || user.role !== 'DONOR' || !donorProfile) return;
    
    // Only poll if status is PENDING or user is not verified
    if (donorProfile.verificationStatus === 'PENDING' || !user.isVerified) {
      const interval = setInterval(() => {
        fetchDonorProfile(user.id, true); // Silent refresh
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user, donorProfile]);

  const fetchDonorProfile = async (userId: string, silent = false) => {
    if (!silent) setIsRefreshing(true);
    
    try {
      const response = await axiosInstance.get(`/api/donors?userId=${userId}`);
      if (response.data.status === 'success' && response.data.data.length > 0) {
        const profile = response.data.data[0];
        
        // Check if status changed
        const statusChanged = previousStatus && previousStatus !== profile.verificationStatus;
        
        setDonorProfile(profile);
        setPreviousStatus(profile.verificationStatus);
        
        // Update user in state and localStorage if verification status changed
        if (profile.verificationStatus === 'VERIFIED' && user && !user.isVerified) {
          const updatedUser = { ...user, isVerified: true };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Show success notification
          if (statusChanged) {
            toast.success('🎉 Congratulations! Your donor profile has been verified!', {
              duration: 5000,
            });
          }
        } else if (profile.verificationStatus === 'REJECTED' && statusChanged) {
          toast.error('Your verification request was rejected. Please check the reason below.', {
            duration: 5000,
          });
        } else if (profile.verificationStatus !== 'VERIFIED' && user && user.isVerified) {
          const updatedUser = { ...user, isVerified: false };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        if (!silent) {
          toast.success('Profile refreshed');
        }
      }
    } catch (error) {
      console.error('Error fetching donor profile:', error);
      if (!silent) {
        toast.error('Failed to refresh profile');
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (user && user.role === 'DONOR') {
      fetchDonorProfile(user.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const backUrl = user.role === 'DONOR' ? '/home' : '/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href={backUrl}>
              <Button variant="ghost" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to {user.role === 'DONOR' ? 'Home' : 'Dashboard'}
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">View and manage your account information</p>
              </div>
              <div className="flex gap-2">
                {user.role === 'DONOR' && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-3xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  <Badge className="mt-3" variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <UserIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Full Name</p>
                    <p className="text-base text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Email Address</p>
                    <p className="text-base text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Role</p>
                    <p className="text-base text-gray-900">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {user.isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 animate-pulse" />
                  ) : donorProfile?.verificationStatus === 'PENDING' ? (
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5 animate-pulse" />
                  ) : donorProfile?.verificationStatus === 'REJECTED' ? (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Verification Status</p>
                      {donorProfile?.verificationStatus === 'PENDING' && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Auto-refreshing
                        </span>
                      )}
                    </div>
                    {user.isVerified ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 text-white animate-pulse">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        {donorProfile?.verifiedAt && (
                          <span className="text-xs text-gray-500">
                            on {new Date(donorProfile.verifiedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : donorProfile?.verificationStatus === 'PENDING' ? (
                      <div>
                        <Badge className="bg-yellow-600 text-white animate-pulse">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Verification
                        </Badge>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your profile is under review. Status updates automatically every 5 seconds.
                        </p>
                      </div>
                    ) : donorProfile?.verificationStatus === 'REJECTED' ? (
                      <div>
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Verification Rejected
                        </Badge>
                        {donorProfile.rejectionReason && (
                          <p className="text-sm text-red-700 mt-1">
                            Reason: {donorProfile.rejectionReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                        {user.role === 'DONOR' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Complete your donor profile to request verification
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <UserIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">User ID</p>
                    <p className="text-base text-gray-900 font-mono text-sm">{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link href={backUrl}>
                <Button variant="outline">
                  Back to {user.role === 'DONOR' ? 'Home' : 'Dashboard'}
                </Button>
              </Link>
              {user.role === 'DONOR' && !user.isVerified && (
                <Link href="/donor-form">
                  <Button 
                    variant="outline" 
                    className="bg-red-50 hover:bg-red-100"
                  >
                    Complete Donor Profile
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
