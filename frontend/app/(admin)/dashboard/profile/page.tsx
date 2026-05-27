'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { User } from '@/lib/auth';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  AlertCircle,
  RefreshCw,
  Loader2,
  Clock,
} from 'lucide-react';

interface DonorProfile {
  id: string;
  userId: string;
  bloodGroup: string;
  verificationStatus: string;
  rejectionReason?: string | null;
  reverificationRequested?: boolean;
  reverificationMessage?: string | null;
  reverificationRequestedAt?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReverificationDialog, setShowReverificationDialog] = useState(false);
  const [reverificationMessage, setReverificationMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    if (userData) {
      setUser(userData);
      if (userData.role === 'DONOR') {
        fetchDonorProfile(userData.id);
      }
    }
    setLoading(false);
  }, [router]);

  const fetchDonorProfile = async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/api/donors/user/${userId}`);
      if (response.data.status === 'success') {
        setDonorProfile(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching donor profile:', error);
      // Don't show error if donor profile doesn't exist yet
      if (error.response?.status !== 404) {
        toast.error('Failed to load donor profile');
      }
    }
  };

  const handleRequestReverification = async () => {
    if (!donorProfile) return;

    setIsProcessing(true);
    try {
      const response = await axiosInstance.patch(
        `/api/donors/${donorProfile.id}/request-reverification`,
        {
          reverificationMessage: reverificationMessage.trim() || null,
        }
      );

      if (response.data.status === 'success') {
        toast.success('Re-verification request submitted successfully!');
        setShowReverificationDialog(false);
        setReverificationMessage('');
        // Refresh donor profile
        if (user) {
          fetchDonorProfile(user.id);
        }
      }
    } catch (error: any) {
      console.error('Error requesting re-verification:', error);
      toast.error(error.response?.data?.message || 'Failed to submit re-verification request');
    } finally {
      setIsProcessing(false);
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your account information</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Donor Verification Status Alert */}
      {user?.role === 'DONOR' && donorProfile && (
        <>
          {donorProfile.verificationStatus === 'REJECTED' && !donorProfile.reverificationRequested && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-red-900">Verification Rejected</CardTitle>
                    <CardDescription className="text-red-700 mt-2">
                      Your donor profile verification was rejected. Please review the reason below and request re-verification if you believe this was an error or if you've addressed the issues.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Rejection Reason:</p>
                  <p className="text-sm text-gray-700">{donorProfile.rejectionReason}</p>
                </div>
                <Button 
                  onClick={() => setShowReverificationDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request Re-verification
                </Button>
              </CardContent>
            </Card>
          )}

          {donorProfile.verificationStatus === 'REJECTED' && donorProfile.reverificationRequested && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-blue-900">Re-verification Pending</CardTitle>
                    <CardDescription className="text-blue-700 mt-2">
                      Your re-verification request has been submitted and is awaiting admin review.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {donorProfile.reverificationMessage && (
                <CardContent>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Your Message:</p>
                    <p className="text-sm text-gray-700">{donorProfile.reverificationMessage}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {donorProfile.verificationStatus === 'PENDING' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-orange-900">Verification Pending</CardTitle>
                    <CardDescription className="text-orange-700 mt-2">
                      Your donor profile is currently under review. You'll be notified once the verification is complete.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {donorProfile.verificationStatus === 'VERIFIED' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-green-900">Verified Donor</CardTitle>
                    <CardDescription className="text-green-700 mt-2">
                      Your donor profile has been verified. You can now participate in blood donation activities.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </>
      )}

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
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Verification Status</p>
                <p className="text-base text-gray-900">
                  {user.isVerified ? 'Verified' : 'Not Verified'}
                </p>
                {!user.isVerified && user.role === 'DONOR' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Complete your donor profile to get verified
                  </p>
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          {user?.role === 'DONOR' && !user.isVerified && (
            <Button 
              variant="outline" 
              className="bg-red-50 hover:bg-red-100"
              onClick={() => router.push('/donor-form')}
            >
              Complete Donor Profile
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Re-verification Dialog */}
      <Dialog open={showReverificationDialog} onOpenChange={setShowReverificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Re-verification</DialogTitle>
            <DialogDescription>
              Please provide any additional information or explain why you believe your profile should be re-verified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {donorProfile?.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-900 mb-1">Previous Rejection Reason:</p>
                <p className="text-sm text-red-700">{donorProfile.rejectionReason}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reverification-message">Your Message (Optional)</Label>
              <Textarea
                id="reverification-message"
                value={reverificationMessage}
                onChange={(e) => setReverificationMessage(e.target.value)}
                placeholder="Explain what changes you've made or why you believe your profile should be re-verified..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent to the admin team for review.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReverificationDialog(false);
                setReverificationMessage('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestReverification}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
